import React, { useState, useEffect } from 'react';
import { ScheduledJob, JobFrequency } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import { getNextRunTimes, getScheduleDescription, formatNextRunDate } from '../../lib/cronUtils';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: ScheduledJob | null;
}

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, jobToEdit }) => {
  const { state, dispatch } = useAppStore();

  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [frequency, setFrequency] = useState<JobFrequency>('daily');
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [customCron, setCustomCron] = useState('0 9 * * 1-5');
  const [inputPrompt, setInputPrompt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobToEdit) {
      setName(jobToEdit.name);
      setAgentId(jobToEdit.agentId);
      setFrequency(jobToEdit.frequency);
      setCustomCron(jobToEdit.cronExpression);
      setInputPrompt(jobToEdit.inputPrompt);
    } else {
      setName('');
      setAgentId(state.agents[0]?.id || '');
      setFrequency('daily');
      setTime('09:00');
      setSelectedDays([1, 2, 3, 4, 5]);
      setCustomCron('0 9 * * 1-5');
      setInputPrompt('Check inbound leads, summarize performance, and sync CRM records.');
    }
    setErrors({});
  }, [jobToEdit, isOpen, state.agents]);

  // Derive cron expression based on selected frequency
  const effectiveCron =
    frequency === 'custom'
      ? customCron
      : getScheduleDescription(frequency, time, selectedDays).cron;

  const humanSchedule =
    frequency === 'custom'
      ? `Custom cron: ${customCron}`
      : getScheduleDescription(frequency, time, selectedDays).human;

  // Live preview of next 3 run times
  const nextRuns = getNextRunTimes(effectiveCron, 3);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Job name is required';
    if (!agentId) errs.agentId = 'Please assign an agent';
    if (!inputPrompt.trim()) errs.inputPrompt = 'Input prompt is required';
    if (frequency === 'custom' && !customCron.trim()) errs.customCron = 'Cron expression is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (jobToEdit) {
      dispatch({
        type: 'UPDATE_JOB',
        payload: {
          ...jobToEdit,
          name: name.trim(),
          agentId,
          frequency,
          humanSchedule,
          cronExpression: effectiveCron,
          inputPrompt: inputPrompt.trim(),
          nextRunAt: nextRuns[0]?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
        },
      });
    } else {
      dispatch({
        type: 'ADD_JOB',
        payload: {
          name: name.trim(),
          agentId,
          frequency,
          humanSchedule,
          cronExpression: effectiveCron,
          enabled: true,
          inputPrompt: inputPrompt.trim(),
        },
      });
    }

    onClose();
  };

  const daysList = [
    { label: 'M', value: 1, name: 'Mon' },
    { label: 'T', value: 2, name: 'Tue' },
    { label: 'W', value: 3, name: 'Wed' },
    { label: 'T', value: 4, name: 'Thu' },
    { label: 'F', value: 5, name: 'Fri' },
    { label: 'S', value: 6, name: 'Sat' },
    { label: 'S', value: 0, name: 'Sun' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobToEdit ? 'Edit Scheduled Job' : 'Create Scheduled Job'}
      description="Configure recurring automation triggers for your agents with custom schedules and prompt parameters."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-1">Job Name *</label>
          <input
            type="text"
            placeholder="e.g. Daily Inbound Lead Sync & Scoring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917]"
          />
          {errors.name && <p className="mt-1 text-xs text-[#DC2626]">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-1">Assigned Agent *</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917]"
          >
            {state.agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name} ({ag.role})
              </option>
            ))}
          </select>
          {errors.agentId && <p className="mt-1 text-xs text-[#DC2626]">{errors.agentId}</p>}
        </div>

        {/* Schedule Frequency selector */}
        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-1.5">Schedule Cadence</label>
          <div className="grid grid-cols-4 gap-2">
            {(['hourly', 'daily', 'weekly', 'custom'] as JobFrequency[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`py-2 text-xs font-semibold capitalize rounded-[10px] border transition-all ${
                  frequency === f
                    ? 'bg-[#FAF8F5] border-[#FF7A59] text-[#1C1917] shadow-2xs'
                    : 'bg-white border-[#ECE7E1] text-[#78716C] hover:border-[#D8D2C9]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Cadence options */}
        {frequency !== 'custom' && frequency !== 'hourly' && (
          <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">Execution Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-2 py-1 text-xs font-mono bg-white border border-[#ECE7E1] rounded-[8px] focus:outline-none focus:border-[#FF7A59]"
              />
            </div>

            {frequency === 'weekly' && (
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">Repeat On</label>
                <div className="flex items-center gap-1.5">
                  {daysList.map((d) => {
                    const isSelected = selectedDays.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        className={`w-8 h-8 rounded-[8px] text-xs font-bold flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-white border border-[#ECE7E1] text-[#78716C] hover:border-[#A8A29E]'
                        }`}
                        title={d.name}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {frequency === 'custom' && (
          <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] space-y-1.5">
            <label className="block text-xs font-bold text-[#1C1917]">Custom Cron Expression</label>
            <input
              type="text"
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              placeholder="e.g. 0 9 * * 1-5"
              className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-[#ECE7E1] rounded-[8px] focus:outline-none focus:border-[#FF7A59]"
            />
            {errors.customCron && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.customCron}</p>
            )}
            <p className="text-[10px] text-[#78716C] font-mono">Format: min hour dom month dow</p>
          </div>
        )}

        {/* Live Preview of Next 3 Run Times */}
        <div className="p-3.5 bg-white rounded-[10px] border border-[#ECE7E1] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
              <Calendar className="w-3.5 h-3.5 text-[#FF7A59]" />
              <span>Next 3 Run Times Preview</span>
            </div>
            <span className="font-mono text-[11px] text-[#78716C]">{effectiveCron}</span>
          </div>

          <div className="space-y-1.5">
            {nextRuns.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-[6px] bg-[#FAF8F5]"
              >
                <span className="text-[#57534E]">Run #{i + 1}</span>
                <span className="font-semibold text-[#1C1917]">{formatNextRunDate(r)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input prompt */}
        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-1">
            Prompt Instructions on Execution *
          </label>
          <textarea
            rows={3}
            placeholder="What should the agent execute during this run?"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917]"
          />
          {errors.inputPrompt && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.inputPrompt}</p>
          )}
        </div>

        <div className="pt-3 border-t border-[#ECE7E1] flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {jobToEdit ? 'Save Changes' : 'Schedule Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
