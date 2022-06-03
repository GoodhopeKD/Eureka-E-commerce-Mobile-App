import moment from 'moment';
import SDate from './SDate';

export default class SDateTime extends SDate {
	private _datetime: string;
	private _time: string;
	private _pretty_time: string;

	has_time : boolean

	constructor(input_datetime: any = null) {
		if (input_datetime == null) input_datetime = '';

		super(input_datetime);

		if (input_datetime === 'now' || input_datetime == '') {
			this._datetime = this._nowDatetime();
			this._time = moment.utc().format('HH:mm') + 'hrs';
		} else {
			this._datetime = moment.utc(input_datetime).format('YYYY-MM-DD HH:mm:ss');
			this._time = this._is_valid_datetime ? moment(input_datetime).format('HH:mm:ss') : '';
			this._pretty_time = this._time ? moment(input_datetime).format('HH:mm') + 'hrs' : '';
		}

		const some_datetime = '2021-08-27T00:00:00.000000Z'

		this.has_time = this._time && moment(input_datetime).format('HH:mm') !== moment(some_datetime).format('HH:mm')
	}

	toString(): string {
		return this._datetime;
	}

	isBefore( another_datetime ): boolean {
		return this._datetime.localeCompare(another_datetime) == -1
	}

	isAfter( another_datetime ): boolean {
		return this._datetime.localeCompare(another_datetime) == 1
	}

	jsDate(offset: any = null): string {
		offset = offset ? offset : SDate.timezoneUTCOffset()
		return this._date+ "T"+this._time+".000"+offset
	}

	date(): string{
		return this._date;
	}

	time(): string{
		return this._time;
	}

	prettyTime(): string{
		return this._pretty_time;
	}

	prettyDatetime(rel_offset_minutes: number = 0): string {
		if (!this._is_valid_datetime) return 'Invalid time and date';

		rel_offset_minutes = rel_offset_minutes !== 0 ? rel_offset_minutes * 60 : 0;

		let time_diff: number = this._nowUnixTimeStamp() - this._unix_timestamp;

		if (rel_offset_minutes <= time_diff && time_diff >= 0) {
			if (
				rel_offset_minutes <= time_diff &&
				time_diff <= 1 // Just now
			)
				return 'just now';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 // Time is in a minute
			)
				return 'a few seconds ago';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 2 // Time is in 2 minutes
			)
				return 'a minute ago';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 // Time is in an hour
			)
				return Math.round(time_diff / 60) + ' minutes ago';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 &&
				moment(this._nowDatetime()).format('DD') === moment(this._datetime).format('DD') // Date is today
			)
				return 'today at ' + this._pretty_time;

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 * 2 &&
				moment(this._nowDatetime()).format('DD') === moment(this._datetime).add(1, 'day').format('DD') // Date is yesterday
			)
				return 'yesterday at ' + this._pretty_time;

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 * 7 // Date is less than a week
			)
				return 'last ' + moment(this._datetime).format('dddd') + ' at ' + this._pretty_time; // Last Friday at 12:45
		} else {
			time_diff = Math.abs(time_diff);

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 2 // Time is in 2 minutes
			)
				return 'in a minute';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 // Time is in an hour
			)
				return 'in ' + Math.round(time_diff / 60) + ' minutes';

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 &&
				moment(this._nowDatetime()).format('DD') === moment(this._datetime).format('DD') // Date is today
			)
				return 'today at ' + this._pretty_time;

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 * 2 &&
				moment(this._nowDatetime()).format('DD') === moment(this._datetime).subtract(1, 'day').format('DD') // Date is tomorrow
			)
				return 'tomorrow at ' + this._pretty_time;

			if (
				rel_offset_minutes <= time_diff &&
				time_diff < 60 * 60 * 24 * 7 // Date is less than a week
			)
				return 'next ' + moment(this._datetime).format('dddd') + ' at ' + this._pretty_time; // Next Friday at 12:45
		}

		if (
			Math.abs(time_diff) < 60 * 60 * 24 * 31 &&
			moment(this._nowDatetime()).format('M') === moment(this._datetime).format('M') // Date is this month
		)
			return moment(this._datetime).format('ddd, D MMM YYYY') + ' at ' + this._pretty_time; // Fri, 21 Dec 2018 at 12:45

		return moment(this._datetime).format('D MMM, YYYY') + ' at ' + this._pretty_time; // 21 Dec, 2018 at 12:33
	}
}
