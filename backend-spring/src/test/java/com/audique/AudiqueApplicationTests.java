package com.audique;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AudiqueApplicationTests {

    @Test
    void applicationBasePackageConfigured() {
        assertTrue(AudiqueApplication.class.getPackageName().startsWith("com.audique"));
    }
}

