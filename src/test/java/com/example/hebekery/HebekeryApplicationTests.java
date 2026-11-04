package com.example.hebekery;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Chỉ kích hoạt khi có kết nối MySQL cục bộ hoặc Docker test container")
class HebekeryApplicationTests {

    @Test
    void contextLoads() {
    }

}
