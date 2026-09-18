package com.infosys.SIMULATION_SERVICE.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.SIMULATION_SERVICE.dto.health.HealthTwinRequest;
import com.infosys.SIMULATION_SERVICE.util.RandomValueGenerator;

@Service
public class HealthGenerator {

    @Autowired
    private RandomValueGenerator random;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HealthTwinRequest generate(HealthTwinRequest health) {
        String effectiveKey = (groqApiKey != null && !groqApiKey.isBlank()) ? groqApiKey : System.getenv("GROQ_API_KEY");

        if (effectiveKey != null && !effectiveKey.isBlank()) {
            try {
                HealthTwinRequest aiHealth = generateViaGroqAi(health, effectiveKey);
                if (aiHealth != null) {
                    System.out.println("AI Vitals Generated via Groq Llama 3.3 for Patient: " + health.getPatientId());
                    System.out.println("Heart Rate: " + aiHealth.getHeartRate() + " | BP: " + aiHealth.getBloodPressure() + " | Temp: " + aiHealth.getTemperature() + " | O2: " + aiHealth.getOxygenLevel() + " | RiskScore: " + aiHealth.getRiskScore());
                    return aiHealth;
                }
            } catch (Exception e) {
                System.out.println("Groq AI simulation generation failed: " + e.getMessage() + ". Using random generator fallback.");
            }
        }

        // Local Random Fallback with adjusted parameters (Heart rate capped at 120 max, BP decreased by ~10%)
        boolean criticalSpike = random.randomInt(1, 100) <= 35;

        if (criticalSpike) {
            // Elevated / High Vital Spike
            health.setHeartRate(random.randomInt(108, 120)); // Capped at 120 max
            health.setBloodPressure(random.randomInt(135, 162) + "/" + random.randomInt(84, 98)); // Decreased by ~10%
            health.setTemperature(Math.round(random.randomDouble(38.2, 39.5) * 10.0) / 10.0);
            health.setOxygenLevel(random.randomInt(88, 92));
            health.setRiskScore(random.randomInt(75, 92));
        } else {
            // Normal to mild values
            health.setHeartRate(random.randomInt(60, 105));
            health.setBloodPressure(random.randomInt(105, 132) + "/" + random.randomInt(60, 84));
            health.setTemperature(Math.round(random.randomDouble(36.2, 37.8) * 10.0) / 10.0);
            health.setOxygenLevel(random.randomInt(94, 100));
            health.setRiskScore(random.randomInt(10, 55));
        }

        health.setLastUpdated(Instant.now());

        System.out.println("[Random Generator" + (criticalSpike ? " SPIKE" : "") + "] Heart Rate : " + health.getHeartRate());
        System.out.println("[Random Generator] BP : " + health.getBloodPressure());
        System.out.println("[Random Generator] Temp : " + health.getTemperature());
        System.out.println("[Random Generator] Oxygen : " + health.getOxygenLevel());
        System.out.println("[Random Generator] Risk Score : " + health.getRiskScore());

        return health;
    }

    private HealthTwinRequest generateViaGroqAi(HealthTwinRequest health, String apiKey) {
        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = "You are a clinical vital sign simulator. Generate realistic human vital signs for a patient health twin simulation.\n" +
                "Existing Vitals: HeartRate=" + health.getHeartRate() + ", BP=" + health.getBloodPressure() + ", Temp=" + health.getTemperature() + ", O2=" + health.getOxygenLevel() + ".\n" +
                "Simulate realistic patient vitals with heart rate up to a max limit of 120 bpm, blood pressure between 105/60 and 160/98, temperature between 36.2 C and 39.2 C, oxygen level between 88% and 100%, and risk score between 10 and 90.\n" +
                "Respond ONLY with a valid JSON object matching this exact schema without markdown, raw text or explanations:\n" +
                "{\n" +
                "  \"heartRate\": 115,\n" +
                "  \"bloodPressure\": \"145/92\",\n" +
                "  \"temperature\": 38.4,\n" +
                "  \"oxygenLevel\": 91,\n" +
                "  \"riskScore\": 78\n" +
                "}";

        String[] models = {"llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"};

        for (String model : models) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                String requestBody = objectMapper.writeValueAsString(new GroqRequest(model, prompt, 0.7, 150));
                HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String content = root.path("choices").get(0).path("message").path("content").asText();

                    content = content.replaceAll("```json", "").replaceAll("```", "").replaceAll("`", "").trim();
                    JsonNode vitalsJson = objectMapper.readTree(content);

                    int hr = Math.min(120, vitalsJson.path("heartRate").asInt(115));
                    health.setHeartRate(hr);
                    health.setBloodPressure(vitalsJson.path("bloodPressure").asText("145/92"));
                    health.setTemperature(Math.round(vitalsJson.path("temperature").asDouble(38.4) * 10.0) / 10.0);
                    health.setOxygenLevel(vitalsJson.path("oxygenLevel").asInt(91));

                    int calculatedRisk = 30;
                    if (health.getHeartRate() > 115 || health.getOxygenLevel() < 92 || health.getTemperature() > 38.5) {
                        calculatedRisk = 80;
                    }
                    health.setRiskScore(vitalsJson.path("riskScore").asInt(calculatedRisk));
                    health.setLastUpdated(Instant.now());

                    return health;
                }
            } catch (Exception e) {
                // try next model fallback
            }
        }
        return null;
    }

    private static class GroqRequest {
        public String model;
        public Message[] messages;
        public double temperature;
        public int max_tokens;

        public GroqRequest(String model, String content, double temperature, int max_tokens) {
            this.model = model;
            this.messages = new Message[]{new Message("user", content)};
            this.temperature = temperature;
            this.max_tokens = max_tokens;
        }

        public static class Message {
            public String role;
            public String content;

            public Message(String role, String content) {
                this.role = role;
                this.content = content;
            }
        }
    }
}