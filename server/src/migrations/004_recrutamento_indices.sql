CREATE INDEX idx_candidaturas_data ON candidaturas (criado_em, id);
CREATE INDEX idx_candidaturas_vaga_data ON candidaturas (vaga_id, criado_em, id);
