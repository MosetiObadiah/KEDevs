CREATE TABLE spotlight_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  overridden_by_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_spotlight_payment 
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX idx_spotlight_slots_developer_id ON spotlight_slots(developer_id);
CREATE INDEX idx_spotlight_slots_type_active ON spotlight_slots(type, is_active);
CREATE INDEX idx_spotlight_slots_end_date_active ON spotlight_slots(end_date) WHERE is_active = true;
CREATE UNIQUE INDEX uk_spotlight_slots_payment_id ON spotlight_slots(payment_id);
