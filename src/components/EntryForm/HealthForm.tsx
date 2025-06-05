import React, { useState } from 'react';
import { HealthData } from '../../types';

interface HealthFormProps {
  data: Partial<HealthData>;
  onChange: (data: Partial<HealthData>) => void;
}

const HealthForm: React.FC<HealthFormProps> = ({ data, onChange }) => {
  const [newSymptom, setNewSymptom] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    time: ''
  });

  const commonSymptoms = [
    '元気がない',
    '食欲不振',
    '嘔吐',
    '下痢',
    '便秘',
    'くしゃみ',
    '咳',
    '鼻水',
    '目やに',
    '発熱',
    'かゆみ',
    '毛玉を吐く'
  ];

  const addSymptom = (symptom: string) => {
    const currentSymptoms = data.symptoms || [];
    if (!currentSymptoms.includes(symptom)) {
      onChange({
        ...data,
        symptoms: [...currentSymptoms, symptom]
      });
    }
  };

  const removeSymptom = (symptom: string) => {
    const currentSymptoms = data.symptoms || [];
    onChange({
      ...data,
      symptoms: currentSymptoms.filter(s => s !== symptom)
    });
  };

  const addCustomSymptom = () => {
    if (newSymptom.trim()) {
      addSymptom(newSymptom.trim());
      setNewSymptom('');
    }
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      const currentMedications = data.medication || [];
      onChange({
        ...data,
        medication: [...currentMedications, { ...newMedication }]
      });
      setNewMedication({ name: '', dosage: '', time: '' });
    }
  };

  const removeMedication = (index: number) => {
    const currentMedications = data.medication || [];
    onChange({
      ...data,
      medication: currentMedications.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="health-form">
      <div className="form-row">
        <div className="form-group">
          <label>体重 (kg)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={data.weight || ''}
            onChange={(e) => onChange({ ...data, weight: parseFloat(e.target.value) || undefined })}
            placeholder="例: 4.2"
          />
        </div>
        <div className="form-group">
          <label>体温 (℃)</label>
          <input
            type="number"
            min="35"
            max="42"
            step="0.1"
            value={data.temperature || ''}
            onChange={(e) => onChange({ ...data, temperature: parseFloat(e.target.value) || undefined })}
            placeholder="例: 38.5"
          />
        </div>
      </div>

      <div className="form-group">
        <label>症状・様子</label>
        <div className="symptoms-section">
          <div className="common-symptoms">
            {commonSymptoms.map(symptom => (
              <button
                key={symptom}
                type="button"
                className={`symptom-btn ${(data.symptoms || []).includes(symptom) ? 'selected' : ''}`}
                onClick={() => 
                  (data.symptoms || []).includes(symptom) 
                    ? removeSymptom(symptom) 
                    : addSymptom(symptom)
                }
              >
                {symptom}
              </button>
            ))}
          </div>
          <div className="custom-symptom-input">
            <input
              type="text"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="その他の症状を追加"
              onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
            />
            <button type="button" onClick={addCustomSymptom}>追加</button>
          </div>
          {data.symptoms && data.symptoms.length > 0 && (
            <div className="selected-symptoms">
              <strong>選択された症状:</strong>
              <div className="symptom-tags">
                {data.symptoms.map(symptom => (
                  <span key={symptom} className="symptom-tag">
                    {symptom}
                    <button type="button" onClick={() => removeSymptom(symptom)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>薬・治療</label>
        <div className="medication-section">
          <div className="medication-input">
            <input
              type="text"
              placeholder="薬名"
              value={newMedication.name}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="用量"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
            />
            <input
              type="time"
              value={newMedication.time}
              onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
            />
            <button type="button" onClick={addMedication}>追加</button>
          </div>
          {data.medication && data.medication.length > 0 && (
            <div className="medication-list">
              {data.medication.map((med, index) => (
                <div key={index} className="medication-item">
                  <span>{med.name} - {med.dosage} {med.time && `(${med.time})`}</span>
                  <button type="button" onClick={() => removeMedication(index)}>削除</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.vetVisit || false}
            onChange={(e) => onChange({ ...data, vetVisit: e.target.checked })}
          />
          <span className="checkmark"></span>
          動物病院を受診した
        </label>
      </div>

      {data.vetVisit && (
        <div className="form-group">
          <label>病院での診断・処置</label>
          <textarea
            value={data.vetNotes || ''}
            onChange={(e) => onChange({ ...data, vetNotes: e.target.value })}
            placeholder="獣医師の診断や処置内容を記入してください..."
            rows={3}
          />
        </div>
      )}

      <div className="form-group">
        <label>その他のメモ</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="健康に関する特記事項があれば記入してください..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default HealthForm;