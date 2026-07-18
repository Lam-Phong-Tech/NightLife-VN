ALTER TABLE "tours"
ADD COLUMN IF NOT EXISTS "departure_schedule" JSONB NOT NULL DEFAULT '{}'::JSONB;

UPDATE "tours"
SET "departure_schedule" = jsonb_build_object(
  'monday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'tuesday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'wednesday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'thursday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'friday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'saturday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  ),
  'sunday', jsonb_build_object(
    'isOff', cardinality("departure_times") = 0,
    'times', to_jsonb("departure_times")
  )
)
WHERE "departure_schedule" = '{}'::JSONB;
