-- WellFinder mini CRM — import once in Hostinger phpMyAdmin
CREATE TABLE IF NOT EXISTS wf_visitors (
  visitor_id VARCHAR(80) NOT NULL,
  email VARCHAR(254) NULL,
  first_visit DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visitor_id),
  KEY idx_wf_visitors_email (email),
  KEY idx_wf_visitors_first_visit (first_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wf_provider_interactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  visitor_id VARCHAR(80) NOT NULL,
  provider_id VARCHAR(190) NOT NULL,
  provider_name VARCHAR(190) NOT NULL,
  provider_type VARCHAR(80) NOT NULL,
  reaction ENUM('liked','disliked') NOT NULL,
  interacted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_visitor_provider (visitor_id,provider_id),
  KEY idx_provider_reaction (provider_id,reaction),
  CONSTRAINT fk_interaction_visitor FOREIGN KEY (visitor_id) REFERENCES wf_visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;