// Source of truth for the three public packages and the verified size rules.
const rtPricing = {
    "services": {
        "interior-only": {"name": "Interior Only", "base": 169, "time": "1.5 hours"},
        "essential": {"name": "Essential Detail", "base": 209, "time": "2.5 hours"},
        "deep-clean": {"name": "Deep Clean & Protect", "base": 269, "time": "3.5 hours"}
    },
    "vehicles": {
        "sedan": {"name": "Sedan / Coupe", "extra": 0, "factor": 1, "adjustment": "Standard price"},
        "compact-suv": {"name": "Compact SUV", "adjustment": "Quote required"},
        "mid-suv": {"name": "Mid-size SUV", "extra": 25, "factor": 1, "adjustment": "+$25"},
        "large-suv": {"name": "Large SUV / Minivan", "extra": 50, "factor": 1, "adjustment": "+$50"},
        "truck": {"name": "Pickup truck", "adjustment": "Quote required"},
        "rv": {"name": "RV", "extra": 0, "factor": 2, "adjustment": "2× base price"}
    }
};

function rtStartingPrice(serviceId, vehicleId) {
    if (!Object.hasOwn(rtPricing.services, serviceId) || !Object.hasOwn(rtPricing.vehicles, vehicleId)) return null;
    const rate = rtPricing.services[serviceId];
    const vehicle = rtPricing.vehicles[vehicleId];
    if (!Number.isFinite(vehicle.factor)) return null;
    return rate.base * vehicle.factor + vehicle.extra;
}

function rtPopulateVehicleSizes(select) {
    for (const [id, vehicle] of Object.entries(rtPricing.vehicles)) {
        select.add(new Option(vehicle.name + ' · ' + vehicle.adjustment, id));
    }
}
