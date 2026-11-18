package com.example.hebekery.service;

import com.example.hebekery.model.AuditLog;
import com.example.hebekery.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String targetType, String targetId, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = (auth != null) ? auth.getName() : "SYSTEM";
        
        AuditLog log = new AuditLog(action, targetType, targetId, actor, details);
        auditLogRepository.save(log);
    }
}
