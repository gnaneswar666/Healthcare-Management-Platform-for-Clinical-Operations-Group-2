package com.infosys.SIMULATION_SERVICE.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.infosys.events.VitalEvent;

@Service
public class VitalProducer {

    private final KafkaTemplate<String, VitalEvent> kafkaTemplate;

    public VitalProducer(KafkaTemplate<String, VitalEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishVitalEvent(VitalEvent event) {
        try {
            kafkaTemplate.send("vital-events", event).whenComplete((result, ex) -> {
                if (ex != null) {
                    System.err.println("Kafka publish failed for patient " + event.getPatientId());
                    ex.printStackTrace();
                } else {
                    System.out.println("Kafka published vital event for patient: " + event.getPatientId() + " to topic vital-events");
                }
            });
        } catch (Exception e) {
            System.err.println("Error publishing vital event: " + e.getMessage());
        }
    }
}
