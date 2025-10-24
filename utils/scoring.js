function calculateScore(placeData) {
    let score = 0;
    const findings = [];

    // Check if business exists (30 points)
    if (placeData && placeData.name) {
        score += 30;
        findings.push({
            severity: 'good',
            title: 'Business Profile Found',
            description: 'Your business has a Google Business Profile, which is the foundation of local SEO.'
        });
    } else {
        findings.push({
            severity: 'critical',
            title: 'Missing Google Business Profile',
            description: 'We couldn\'t find a verified Google Business Profile. You\'re invisible to 97% of local searches.'
        });
    }

    // Check reviews (25 points)
    if (placeData && placeData.user_ratings_total) {
        if (placeData.user_ratings_total >= 10) {
            score += 25;
            findings.push({
                severity: 'good',
                title: `${placeData.user_ratings_total} Customer Reviews`,
                description: `Your ${placeData.rating} star rating builds trust with potential customers.`
            });
        } else {
            score += 10;
            findings.push({
                severity: 'warning',
                title: 'Limited Reviews',
                description: `Only ${placeData.user_ratings_total} reviews. Aim for at least 10 to build credibility.`
            });
        }
    } else {
        findings.push({
            severity: 'critical',
            title: 'No Customer Reviews',
            description: '86% of consumers read reviews before visiting. Zero reviews severely hurt credibility.'
        });
    }

    // Check photos (20 points)
    if (placeData && placeData.photos && placeData.photos.length > 0) {
        if (placeData.photos.length >= 5) {
            score += 20;
            findings.push({
                severity: 'good',
                title: `${placeData.photos.length} Photos Added`,
                description: 'Great! Businesses with photos get 42% more direction requests.'
            });
        } else {
            score += 10;
            findings.push({
                severity: 'warning',
                title: 'Limited Photos',
                description: `Only ${placeData.photos.length} photos. Add more to increase engagement by 42%.`
            });
        }
    } else {
        findings.push({
            severity: 'critical',
            title: 'No Business Photos',
            description: 'Photos increase direction requests by 42% and website clicks by 35%.'
        });
    }

    // Check business hours (15 points)
    if (placeData && placeData.opening_hours) {
        score += 15;
        findings.push({
            severity: 'good',
            title: 'Business Hours Listed',
            description: 'Customers can see when you\'re open, reducing frustration and lost visits.'
        });
    } else {
        findings.push({
            severity: 'warning',
            title: 'Missing Business Hours',
            description: 'Add your hours so customers know when to visit. This reduces bounce rates.'
        });
    }

    // Check website (10 points)
    if (placeData && placeData.website) {
        score += 10;
        findings.push({
            severity: 'good',
            title: 'Website Link Added',
            description: 'Your website link helps customers learn more and increases conversions.'
        });
    } else {
        findings.push({
            severity: 'warning',
            title: 'No Website Link',
            description: 'Adding a website link can increase traffic and conversions significantly.'
        });
    }

    return {
        score: Math.min(score, 100),
        findings: findings
    };
}

module.exports = { calculateScore };
