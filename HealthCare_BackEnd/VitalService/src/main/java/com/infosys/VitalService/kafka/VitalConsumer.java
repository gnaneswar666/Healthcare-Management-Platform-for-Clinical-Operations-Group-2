package com.infosys.VitalService.kafka;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.infosys.VitalService.Modal.VitalService;
import com.infosys.VitalService.Resources.VitalServiceRepository;
import com.infosys.events.VitalEvent;

@Component
public class VitalConsumer {

    @Autowired
    private VitalServiceRepository repository;

    @KafkaListener(topics = "vital-events", groupId = "vital-service-group")
    public void consume(VitalEvent event) {
        if (event == null || event.getPatientId() == null) {
            System.err.println("Received invalid VitalEvent in VitalService Consumer");
            return;
        }

        System.out.println("VitalService Kafka Consumer received event for patient: " + event.getPatientId());

        VitalService vital = new VitalService();
        vital.setPatientId(event.getPatientId());
        vital.setHeartRate(event.getHeartRate() != null ? event.getHeartRate() : 0);
        vital.setBloodPressure(event.getBloodPressure() != null ? event.getBloodPressure() : "120/80");
        vital.setOxygenLevel(event.getOxygenLevel() != null ? event.getOxygenLevel() : 98);
        vital.setTemperature(event.getTemperature() != null ? event.getTemperature() : 36.8);
        vital.setTimestamp(event.getTimestamp() != null ? event.getTimestamp() : Instant.now());

        VitalService saved = repository.save(vital);
        System.out.println("Saved vital record to VitalService MongoDB collection 'Vitals' with ID: " + saved.getId());
    }
}
