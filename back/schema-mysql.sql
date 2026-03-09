-- Yuan Monitor 监控平台 - MySQL 表结构（与 back/db.js 逻辑对应）
-- 使用方式: mysql -u root -p < back/schema-mysql.sql
-- 或: mysql -u root -e "source back/schema-mysql.sql"

CREATE DATABASE IF NOT EXISTS yuan_monitor DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yuan_monitor;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  app_key VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) DEFAULT NULL,
  user_id VARCHAR(255) DEFAULT NULL,
  user_data_json TEXT DEFAULT NULL,
  report_type VARCHAR(64) NOT NULL,
  sub_type VARCHAR(64) DEFAULT NULL,
  payload_json LONGTEXT NOT NULL,
  env_json TEXT DEFAULT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_reports_type (report_type),
  INDEX idx_reports_created (created_at),
  INDEX idx_reports_app_key (app_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS session_replays (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  app_key VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) DEFAULT NULL,
  user_id VARCHAR(255) DEFAULT NULL,
  events_json LONGTEXT NOT NULL,
  duration_ms BIGINT DEFAULT NULL,
  last_error_time BIGINT DEFAULT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_session_replays_created (created_at),
  INDEX idx_session_replays_app_key (app_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
