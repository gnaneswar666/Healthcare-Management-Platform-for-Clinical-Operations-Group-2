package com.infosys.SIMULATION_SERVICE.service;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.SIMULATION_SERVICE.client.DiagnosticClient;
import com.infosys.SIMULATION_SERVICE.client.HealthTwinClient;
import com.infosys.SIMULATION_SERVICE.client.PatientClient;
import com.infosys.SIMULATION_SERVICE.client.VitalClient;
import com.infosys.SIMULATION_SERVICE.dto.diagnosis.DiagnosticRequest;
import com.infosys.SIMULATION_SERVICE.dto.health.HealthTwinRequest;
import com.infosys.SIMULATION_SERVICE.dto.patient.PatientResponse;
import com.infosys.SIMULATION_SERVICE.kafka.VitalProducer;
import com.infosys.events.VitalEvent;

@Service
public class SimulationService {

    @Autowired
    private PatientClient patientClient;

    @Autowired
    private HealthTwinClient healthTwinClient;

    @Autowired
    private DiagnosticClient diagnosticClient;

    @Autowired
    private VitalClient vitalClient;

    @Autowired
    private HealthGenerator healthGenerator;

    @Autowired
    private DiagnosticGenerator diagnosticGenerator;

    @Autowired
    private VitalProducer vitalProducer;

    public void simulatePatients() {

        System.out.println("======================================");
        System.out.println("Simulation Started");
        System.out.println("======================================");

        List<PatientResponse> patients = patientClient.getAllPatients();

        if (patients == null || patients.isEmpty()) {
            System.out.println("No Patients Found");
            return;
        }

        for (PatientResponse patient : patients) {

            try {

                HealthTwinRequest health = healthTwinClient.getTwin(patient.getPatientId());
                health = healthGenerator.generate(health);

                // 1. Update HealthTwin MongoDB via Feign REST
                healthTwinClient.updateTwin(patient.getPatientId(), health);

                // 2. Save Vital reading to VitalService MongoDB collection ("Vitals") via Feign REST
                try {
                    vitalClient.addVitals(health);
                } catch (Exception ve) {
                    System.out.println("VitalClient REST call fallback: " + ve.getMessage());
                }

                // 3. Publish Kafka VitalEvent to topic "vital-events" for real-time Kafka consumers
                VitalEvent event = new VitalEvent();
                event.setPatientId(patient.getPatientId());
                event.setHeartRate(health.getHeartRate());
                event.setTemperature(health.getTemperature());
                event.setOxygenLevel(health.getOxygenLevel());
                event.setBloodPressure(health.getBloodPressure());
                event.setTimestamp(Instant.now());

                vitalProducer.publishVitalEvent(event);

                DiagnosticRequest diagnostic = diagnosticGenerator.generate(patient);
                diagnosticClient.saveDiagnostic(diagnostic);

                System.out.println("Updated HealthTwin, Vitals DB & Published Kafka Event for Patient : " + patient.getPatientId());

            } catch (Exception e) {

                System.out.println("Failed for Patient : " + patient.getPatientId());
                System.out.println(e.getMessage());
            }

        }

        System.out.println("Simulation Completed");
    }
}
