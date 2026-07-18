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
      hours: '19:00 - 20:00, 20:30 - 21:30',
    });
    expect(schedule.sunday).toEqual(schedule.monday);
    expect(collectTourDepartureTimes(schedule)).toEqual(['19:00', '20:30']);
  });

  it('resolves the configured weekday and time in Vietnam', () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: false, hours: '19:00 - 21:30' },
      tuesday: { isOff: true, hours: '' },
      wednesday: { isOff: true, hours: '' },
      thursday: { isOff: true, hours: '' },
      friday: { isOff: true, hours: '' },
      saturday: { isOff: true, hours: '' },
      sunday: { isOff: true, hours: '' },
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
      allowedTimes: ['19:00', '20:00', '21:00'],
    });
  });

  it('returns no allowed times for an off day', () => {
    const schedule = normalizeTourDepartureSchedule({
      monday: { isOff: true, hours: '' },
      tuesday: { isOff: false, hours: '20:00 - 22:00' },
      wednesday: { isOff: true, hours: '' },
      thursday: { isOff: true, hours: '' },
      friday: { isOff: true, hours: '' },
      saturday: { isOff: true, hours: '' },
      sunday: { isOff: true, hours: '' },
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
