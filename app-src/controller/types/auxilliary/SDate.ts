import moment from 'moment';

export default class SDate {
	protected _date: string;
	protected _unix_timestamp: number;

	protected _is_valid_datetime: boolean;

	constructor(input_date: any = null) {
		if (input_date == null) input_date = '';

		if (input_date === 'now' || input_date === 'today'|| input_date == '') {
			this._is_valid_datetime = true;
			this._date = moment.utc().format('YYYY-MM-DD');
			this._unix_timestamp = moment.utc().unix();
		} else {
			this._is_valid_datetime = moment.utc(input_date).isValid();
			this._date = moment.utc(input_date).format('YYYY-MM-DD');
			this._unix_timestamp = moment.utc(input_date).unix();
		}
	}

	protected _nowDatetime(): string {
		return moment.utc().format('YYYY-MM-DD HH:mm:ss');
	}

	protected _nowUnixTimeStamp(): number {
		return moment.utc().unix();
	}

	static timezoneUTCOffset(): String {
		return moment().format('Z');
	}

	toString(): string {
		return this._date;
	}

	
	isBefore( another_date ): boolean {
		return this._date.localeCompare(another_date) == -1
	}

	isAfter( another_date ): boolean {
		return this._date.localeCompare(another_date) == 1
	}

	jsDate(offset: any = null): string {
		offset = offset ? offset : SDate.timezoneUTCOffset()
		return this._date+ "T00:00:00.000"+offset
	}

	prettyDate(rel_offset_days: number = 0): string {
		if (!this._is_valid_datetime) return 'Invalid date';

		rel_offset_days = rel_offset_days !== 0 ? rel_offset_days * 60 * 60 * 24 : 0;

		let time_diff: number = this._nowUnixTimeStamp() - this._unix_timestamp;

		if (rel_offset_days <= time_diff && time_diff >= 0) {
			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 &&
				moment(this._nowDatetime()).format('DD') === moment(this._date).format('DD') // Date is today
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Today)';// 21, Dec 2018 (Today)

			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 * 2 &&
				moment(this._nowDatetime()).format('DD') === moment(this._date).add(1, 'day').format('DD') // Date is yesterday
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Yesterday)'; // 21, Dec 2018 (Yesterday)

			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 * 7 // Date is less than a week
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Last ' + moment(this._date).format('dddd') + ')'; // 21, Dec 2018 (Last Friday)
		} else {
			time_diff = Math.abs(time_diff);

			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 &&
				moment(this._nowDatetime()).format('DD') === moment(this._date).format('DD') // Date is today
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Today)';// 21, Dec 2018 (Today)

			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 * 2 &&
				moment(this._nowDatetime()).format('DD') === moment(this._date).subtract(1, 'day').format('DD') // Date is tomorrow
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Tomorrow)'; // 21, Dec 2018 (Tomorrow)

			if (
				rel_offset_days <= time_diff &&
				time_diff < 60 * 60 * 24 * 7 // Date is less than a week
			)
				return moment(this._date).format('D MMM, YYYY') + ' (Next ' + moment(this._date).format('dddd') + ')'; // 21, Dec 2018 (Next Friday)
		}

		if (
			Math.abs(time_diff) < 60 * 60 * 24 * 31 &&
			moment(this._nowDatetime()).format('M') === moment(this._date).format('M') // Date is this month
		)
			return moment(this._date).format('ddd, D MMM YYYY'); // Fri, 21 Dec 2018

		return moment(this._date).format('D MMMM, YYYY'); // 21 December, 2018
	}
}
