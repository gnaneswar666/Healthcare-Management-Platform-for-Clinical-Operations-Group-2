package com.infosys.HealthTwin.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.infosys.HealthTwin.Modal.HealthTwin;
import com.infosys.HealthTwin.Repository.HealthTwinRepository;
import com.infosys.events.VitalEvent;

@Component
public class VitalConsumer {

    private final HealthTwinRepository repository;

    public VitalConsumer(HealthTwinRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = "vital-events", groupId = "health-group")
    public void consume(VitalEvent event) {

        if (event == null || event.getPatientId() == null) {
            System.err.println("Received null or invalid VitalEvent");
            return;
        }

        System.out.println("Received Kafka Vital Event for Patient: " + event.getPatientId());

        HealthTwin twin = repository.findByPatientId(event.getPatientId())
                .orElseGet(() -> {
                    HealthTwin newTwin = new HealthTwin();
                    newTwin.setPatientId(event.getPatientId());
                    return newTwin;
                });

        twin.setHeartRate(event.getHeartRate());
        twin.setTemperature(event.getTemperature());
        twin.setOxygenLevel(event.getOxygenLevel());
        twin.setBloodPressure(event.getBloodPressure());
        twin.setLastUpdated(event.getTimestamp());

        repository.save(twin);

        System.out.println("Health Twin asynchronously updated via Kafka for Patient: " + event.getPatientId());
    }

}
