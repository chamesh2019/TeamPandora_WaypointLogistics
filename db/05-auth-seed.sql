-- Better Auth Seed Accounts for Operational Roles
-- Links 1:1 with domain users table from 02-seed.sql

INSERT INTO "user" ("id", "name", "email", "emailVerified", "username", "displayUsername", "role", "depotId", "outletId", "phoneNumber", "createdAt", "updatedAt")
VALUES
  ('usr-disp-001', 'Sarath Gunawardena', 'dispatcher@waypoint.lk', TRUE, 'dispatcher', 'dispatcher', 'dispatcher', 'PELIYAGODA', NULL, '0714455661', NOW(), NOW()),
  ('usr-load-001', 'Sunil Jayasinghe', 'loader@waypoint.lk', TRUE, 'loader', 'loader', 'loader', 'PELIYAGODA', NULL, '0714455662', NOW(), NOW()),
  ('usr-driv-001', 'Nimal Fernando', 'driver@waypoint.lk', TRUE, 'driver', 'driver', 'driver', 'PELIYAGODA', NULL, '0714455663', NOW(), NOW()),
  ('usr-stor-001', 'Anura Silva', 'store@waypoint.lk', TRUE, 'store_manager', 'store_manager', 'store_manager', NULL, 'OUT001', '0771234501', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
VALUES
  ('acc-disp-001', 'usr-disp-001', 'credential', 'usr-disp-001', 'a03fe187fd7b90370b05169381b17697:29a9187eb28eb9128cd495cd1844e3ecf33aee584dd670ef81702052ae857a61ea9fd1ea0a6eb806a7e1fb7e2e0b0c40abf5b6e7785291517fb0a9f45ed456bc', NOW(), NOW()),
  ('acc-load-001', 'usr-load-001', 'credential', 'usr-load-001', '7fd66d021ce0d92a9e2571159546f824:6622c449a8cf7e2d35d5ed1766d8c1c2fe3b3f17a417a0c282fa63bcfe3564aaaedc29d74665ab29f7604ca8c8fdfede2255c23130864a577cbbe59b8daef527', NOW(), NOW()),
  ('acc-driv-001', 'usr-driv-001', 'credential', 'usr-driv-001', 'c3e9270c2e79d9ce34585d82a43d149f:dc2c7762ad3623d5a9426d2bdb8654d30a7336235ec6cf9743551a15c4626f19cfd59f95abbc62d2e9855ce44d08c41ba148b18b2cd731ccd80b762dd3b65064', NOW(), NOW()),
  ('acc-stor-001', 'usr-stor-001', 'credential', 'usr-stor-001', '9b24d22625e76d3c39e95a33cc61a3ad:d0c3ca78dda8d9b0faf81339b1c6f56b093d78eddb45a8cea735604157e4ff48438e07a8b8c2b80b9533f849bb2eb629dc377d681c4b61e975b2d564bbe7225f', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
