-- UpdateUserPreferences.sql
UPDATE UserPreferences
SET Value = @Value
WHERE UserId = @UserId AND PreferenceKey = @PreferenceKey;
