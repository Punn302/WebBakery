package com.example.hebekery.config;

import jakarta.persistence.EntityManagerFactory;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.sql.DataSource;

@Configuration
public class LiquibaseConfig {

    @Value("${spring.liquibase.change-log:classpath:db/changelog/db.changelog-master.yaml}")
    private String changeLog;

    @Value("${spring.liquibase.enabled:true}")
    private boolean enabled;

    @Bean(name = "liquibase")
    @ConditionalOnProperty(name = "spring.liquibase.enabled", havingValue = "true", matchIfMissing = true)
    public SpringLiquibase liquibase(DataSource dataSource) {
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource);
        liquibase.setChangeLog(changeLog);
        liquibase.setShouldRun(enabled);
        return liquibase;
    }

    @Bean
    public static BeanFactoryPostProcessor entityManagerFactoryDependsOnLiquibase() {
        return beanFactory -> {
            for (String name : beanFactory.getBeanNamesForType(LocalContainerEntityManagerFactoryBean.class, true, false)) {
                String rawName = name.startsWith("&") ? name.substring(1) : name;
                if (beanFactory.containsBeanDefinition(rawName)) {
                    addDependsOn(beanFactory.getBeanDefinition(rawName), "liquibase");
                }
            }
            for (String name : beanFactory.getBeanNamesForType(EntityManagerFactory.class, true, false)) {
                String rawName = name.startsWith("&") ? name.substring(1) : name;
                if (beanFactory.containsBeanDefinition(rawName)) {
                    addDependsOn(beanFactory.getBeanDefinition(rawName), "liquibase");
                }
            }
        };
    }

    private static void addDependsOn(BeanDefinition bd, String beanName) {
        String[] dependsOn = bd.getDependsOn();
        if (dependsOn == null || dependsOn.length == 0) {
            bd.setDependsOn(beanName);
            return;
        }
        for (String dep : dependsOn) {
            if (dep.equals(beanName)) {
                return;
            }
        }
        String[] newDependsOn = new String[dependsOn.length + 1];
        System.arraycopy(dependsOn, 0, newDependsOn, 0, dependsOn.length);
        newDependsOn[dependsOn.length] = beanName;
        bd.setDependsOn(newDependsOn);
    }
}
