// Source of truth: two primary packages, separately quoted specialty work and verified size rules.
const rtPricing = {
    "services": {
        "interior-only": {
            "name": "Interior Detail",
            "base": 179,
            "time": "about 2 hours"
        },
        "essential": {
            "name": "Full Detail",
            "base": 239,
            "time": "about 3 hours"
        }
    },
    "vehicles": {
        "sedan": {
            "name": "Sedan / Coupe",
            "extra": 0,
            "factor": 1,
            "adjustment": "Standard price"
        },
        "compact-suv": {
            "name": "Compact SUV",
            "adjustment": "Quote required"
        },
        "mid-suv": {
            "name": "Mid-size SUV",
            "extra": 25,
            "factor": 1,
            "adjustment": "+$25"
        },
        "large-suv": {
            "name": "Large SUV / Minivan",
            "extra": 50,
            "factor": 1,
            "adjustment": "+$50"
        },
        "truck": {
            "name": "Pickup truck",
            "adjustment": "Quote required"
        },
        "rv": {
            "name": "RV",
            "extra": 0,
            "factor": 2,
            "adjustment": "2\u00d7 base price"
        }
    },
    "specialties": {
        "deep-clean": {
            "name": "Deep cleaning / extraction — custom quote",
            "time": "Quoted after assessment"
        }
    }
};

function rtGetService(serviceId) {
    for (const group of [rtPricing.services, rtPricing.specialties]) {
        if (Object.hasOwn(group, serviceId)) return group[serviceId];
    }
    return null;
}

function rtStartingPrice(serviceId, vehicleId) {
    const rate = rtGetService(serviceId);
    if (!rate || !Number.isFinite(rate.base) || !Object.hasOwn(rtPricing.vehicles, vehicleId)) return null;
    const vehicle = rtPricing.vehicles[vehicleId];
    if (!Number.isFinite(vehicle.factor)) return null;
    return rate.base * vehicle.factor + vehicle.extra;
}

function rtPopulateVehicleSizes(select) {
    for (const [id, vehicle] of Object.entries(rtPricing.vehicles)) {
        select.add(new Option(vehicle.name + ' · ' + vehicle.adjustment, id));
    }
}
