/**
 * OrganLink Compatibility & Ranking Core Logic
 */

// Blood Group Compatibility Matrix (ABO & Rh factor check)
// Returns true if donor blood type can be received by recipient blood type.
export const checkBloodCompatibility = (donor, recipient) => {
  // Normalize strings
  const d = donor.trim().toUpperCase();
  const r = recipient.trim().toUpperCase();

  // Parse type and sign
  const dRh = d.endsWith('+') ? '+' : '-';
  const rRh = r.endsWith('+') ? '+' : '-';
  const dType = d.slice(0, -1);
  const rType = r.slice(0, -1);

  // Rh factor rule: Rh- can give to Rh+ or Rh-, but Rh+ can only give to Rh+
  if (dRh === '+' && rRh === '-') {
    return false;
  }

  // ABO compatibility rules
  if (dType === 'O') return true; // O is universal donor (Rh ruled separately above)
  if (dType === 'A') return rType === 'A' || rType === 'AB';
  if (dType === 'B') return rType === 'B' || rType === 'AB';
  if (dType === 'AB') return rType === 'AB';

  return false;
};

// Haversine Distance Formula (to compute straight-line distance in km)
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Simulated travel time calculator (Fallback for Google Maps Distance Matrix)
// Returns { travelTimeMinutes, travelDistanceKm, transitType }
export const calculateTravelTime = async (lat1, lon1, lat2, lon2) => {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isMapsConfigured = mapsApiKey && mapsApiKey !== '' && !mapsApiKey.startsWith('your_');

  const distanceKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);

  if (isMapsConfigured) {
    try {
      // NOTE: For client-side requests, a CORS proxy or standard maps loader is usually preferred.
      // We implement a fetch call to the Distance Matrix API as reference, 
      // but fallback to the simulator if it fails.
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${mapsApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const durationSec = data.rows[0].elements[0].duration.value;
        const distanceMeters = data.rows[0].elements[0].distance.value;
        
        return {
          travelTimeMinutes: Math.round(durationSec / 60),
          travelDistanceKm: parseFloat((distanceMeters / 1000).toFixed(1)),
          transitType: distanceKm > 150 ? 'Air Ambulance (Live GPS)' : 'Ground Transit (Live GPS)'
        };
      }
    } catch (err) {
      console.warn("Google Maps Distance Matrix call failed, falling back to simulator:", err);
    }
  }

  // --- SIMULATION MODE ---
  // If distance > 150km, we assume helicopter/air ambulance transport.
  // Helicopter speed: ~250 km/h. Plus 90 minutes overhead (loading, airport transfer, FAA clearance).
  // Ground transit: ~75 km/h. Plus 30 minutes overhead (hospital pick-up, traffic).
  let travelTimeMinutes = 0;
  let transitType = '';

  if (distanceKm > 150) {
    transitType = 'Air Ambulance (Simulated)';
    const flightHours = distanceKm / 250;
    const overheadHours = 1.5;
    travelTimeMinutes = Math.round((flightHours + overheadHours) * 60);
  } else {
    transitType = 'Ground Transit (Simulated)';
    const drivingHours = distanceKm / 75;
    const overheadHours = 0.5;
    travelTimeMinutes = Math.round((drivingHours + overheadHours) * 60);
  }

  return {
    travelTimeMinutes,
    travelDistanceKm: parseFloat(distanceKm.toFixed(1)),
    transitType
  };
};

/**
 * Score and rank matching recipient candidates
 * @param {Object} donorOrg - { lat, lng, viabilityHours, bloodGroup, organType }
 * @param {Array} candidates - Array of waitlisted recipients
 * @param {Array} hospitals - Array of seeded hospitals to look up coordinates
 */
export const rankCandidates = async (donorOrg, candidates, hospitals) => {
  const results = [];

  for (const recipient of candidates) {
    // 1. Double check compatibility
    if (recipient.organNeeded.toLowerCase() !== donorOrg.organType.toLowerCase()) continue;
    if (!checkBloodCompatibility(donorOrg.bloodGroup, recipient.bloodGroup)) continue;

    // 2. Resolve recipient hospital coordinates
    const recipientHosp = hospitals.find(h => h.hospitalId === recipient.hospitalId);
    if (!recipientHosp) continue;

    // 3. Compute Travel metrics
    const travel = await calculateTravelTime(
      donorOrg.lat,
      donorOrg.lng,
      recipientHosp.lat,
      recipientHosp.lng
    );

    const travelHours = travel.travelTimeMinutes / 60;
    const viabilityHours = parseFloat(donorOrg.viabilityHours);

    // 4. Calculate Scores
    // Medical Urgency Score: (0-100)
    const urgency = recipient.urgencyScore;

    // Transport Feasibility Score: based on remaining viability hours after transit
    // If transport takes longer than viability window, feasibility drops to 0 (unacceptable match)
    const remainingViability = viabilityHours - travelHours;
    const transportFeasibility = remainingViability <= 0 
      ? 0 
      : Math.min(100, Math.max(0, (remainingViability / viabilityHours) * 100));

    // Compatibility Fit Score: Perfect blood type match gets 100, compatible but non-identical gets 70
    const compatibilityFit = donorOrg.bloodGroup.toUpperCase() === recipient.bloodGroup.toUpperCase() 
      ? 100 
      : 70;

    // 5. Final Ranked Score (Weighted Formula)
    // Urgency (45%) + Transport Feasibility (35%) + Compatibility (20%)
    // -- SIMULATED VERTEX AI MODEL PREDICTION --
    // In a production system, this weighted heuristics formula would be replaced by an API request
    // to a Vertex AI endpoint, taking in tabular patient/match history and returning a likelihood of success.
    
    // Vertex AI Placeholder Comment Indicator
    /* VERTEX_AI_MODEL_HOOK:
       const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/.../endpoints/...:predict', {
         body: JSON.stringify({ instances: [{ urgency, travelHours, viabilityHours, bloodMatches: compatibilityFit }] })
       });
       const rankScore = (await response.json()).predictions[0];
    */
    
    let rankScore = 0;
    if (transportFeasibility === 0) {
      rankScore = 0; // Discard completely if transport time exceeds viability window
    } else {
      rankScore = parseFloat(
        ((urgency * 0.45) + (transportFeasibility * 0.35) + (compatibilityFit * 0.2)).toFixed(1)
      );
    }

    results.push({
      ...recipient,
      travelTimeMinutes: travel.travelTimeMinutes,
      travelDistanceKm: travel.travelDistanceKm,
      transitType: travel.transitType,
      compatibilityScore: compatibilityFit,
      feasibilityScore: parseFloat(transportFeasibility.toFixed(1)),
      rankScore
    });
  }

  // Sort descending by rankScore and return top 5
  return results
    .filter(r => r.rankScore > 0)
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 5);
};
