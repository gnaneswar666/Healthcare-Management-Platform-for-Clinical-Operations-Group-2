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
                    System.out.println("Heart Rate: " + aiHealth.getHeartRate() + " | BP: " + aiHealth.getBloodPressure() + " | Temp: " + aiHealth.getTemperature() + " | O2: " + aiHealth.getOxygenLevel());
                    return aiHealth;
                }
            } catch (Exception e) {
                System.out.println("Groq AI simulation generation failed: " + e.getMessage() + ". Using random generator fallback.");
            }
        }

        // Local Random Fallback
        health.setHeartRate(random.randomInt(65, 100));
        health.setBloodPressure(random.randomInt(110, 155) + "/" + random.randomInt(60, 90));
        health.setTemperature(Math.round(random.randomDouble(36.0, 38.5) * 10.0) / 10.0);
        health.setOxygenLevel(random.randomInt(93, 100));
        health.setLastUpdated(Instant.now());

        System.out.println("[Random Fallback] Heart Rate : " + health.getHeartRate());
        System.out.println("[Random Fallback] BP : " + health.getBloodPressure());
        System.out.println("[Random Fallback] Temp : " + health.getTemperature());
        System.out.println("[Random Fallback] Oxygen : " + health.getOxygenLevel());

        return health;
    }

    private HealthTwinRequest generateViaGroqAi(HealthTwinRequest health, String apiKey) {
        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = "You are a clinical vital sign simulator. Generate realistic human vital signs for a patient health twin simulation.\n" +
                "Existing Vitals: HeartRate=" + health.getHeartRate() + ", BP=" + health.getBloodPressure() + ", Temp=" + health.getTemperature() + ", O2=" + health.getOxygenLevel() + ".\n" +
                "Respond ONLY with a valid JSON object matching this exact schema without markdown, raw text or explanations:\n" +
                "{\n" +
                "  \"heartRate\": 75,\n" +
                "  \"bloodPressure\": \"120/80\",\n" +
                "  \"temperature\": 36.8,\n" +
                "  \"oxygenLevel\": 98\n" +
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

                    content = content.replaceAll("`json", "").replaceAll("`", "").trim();
                    JsonNode vitalsJson = objectMapper.readTree(content);

                    health.setHeartRate(vitalsJson.path("heartRate").asInt(75));
                    health.setBloodPressure(vitalsJson.path("bloodPressure").asText("120/80"));
                    health.setTemperature(Math.round(vitalsJson.path("temperature").asDouble(36.8) * 10.0) / 10.0);
                    health.setOxygenLevel(vitalsJson.path("oxygenLevel").asInt(98));
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
