package com.infosys.SIMULATION_SERVICE.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.infosys.SIMULATION_SERVICE.dto.health.HealthTwinRequest;

@FeignClient(name = "VITALSERVICE")
public interface VitalClient {

    @PostMapping("/api/vitals")
    Object addVitals(@RequestBody HealthTwinRequest request);
}
