package com.hospital;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		// Dùng issuer-uri giả để test context load không kết nối Keycloak thật
		"spring.security.oauth2.resourceserver.jwt.issuer-uri=",
		"spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://example.com/.well-known/jwks.json"
})
class HospitalApplicationTests {

	@Test
	void contextLoads() {
	}

}
