import {
  collectTourDepartureTimes,
  normalizeTourDepartureSchedule,
  tourDepartureSlotForInstant,
} from './tour-departure-schedule';

describe('tour departure schedule', () => {
  it('converts legacy departure times into a daily schedule', () => {
    const schedule = normalizeTourDepartureSchedule(undefined, [
      '20:30',
      '19:00',
      '20:30',
    ]);

    expect(schedule.monday).toEqual({
      isOff: false,
      times: ['19:00', '20:30'],
    });
    expect(schedule.sunday).toEqual(schedule.monday);
    expect(collectTourDepartureTimes(schedule)).toEqual(['19:00', '20:30']);
  });

  it('resolves the configured weekday and time in Vietnam', () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, times: ['19:00', '20:30'] },
      tuesday: { isOff: true, times: [] },
      wednesday: { isOff: true, times: [] },
      thursday: { isOff: true, times: [] },
      friday: { isOff: true, times: [] },
      saturday: { isOff: true, times: [] },
      sunday: { isOff: true, times: [] },
    });

    expect(
      tourDepartureSlotForInstant({
        departureSchedule: schedule,
        departureTimes: [],
        scheduledAt: new Date('2026-07-20T12:00:00.000Z'),
      }),
    ).toEqual({
      configured: true,
      weekday: 'monday',
      time: '19:00',
      allowedTimes: ['19:00', '20:30'],
    });
  });

  it('returns no allowed times for an off day', () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: true, times: ['19:00'] },
      tuesday: { isOff: false, times: ['20:00'] },
      wednesday: { isOff: true, times: [] },
      thursday: { isOff: true, times: [] },
      friday: { isOff: true, times: [] },
      saturday: { isOff: true, times: [] },
      sunday: { isOff: true, times: [] },
    });

    const slot = tourDepartureSlotForInstant({
      departureSchedule: schedule,
      departureTimes: ['22:00'],
      scheduledAt: new Date('2026-07-20T12:00:00.000Z'),
    });

    expect(slot.configured).toBe(true);
    expect(slot.allowedTimes).toEqual([]);
  });
});
