const initial_state = {
	selected: null,
	collection: {
		data: [],
		links: {
			first: 'http://api.eureka.dev/products?page=0',
			last: 'http://api.eureka.dev/products?page=0',
			prev: null,
			next: null
		},
		meta: {
			current_page: 1,
			from: null,
			last_page: 1,
			links: [
				{
					url: null,
					label: '&laquo; Previous',
					active: false
				},
				{
					url: 'http://api.eureka.dev/products?page=0',
					label: '1',
					active: true
				},
				{
					url: null,
					label: 'Next &raquo;',
					active: false
				}
			],
			path: 'http://api.eureka.dev/products',
			per_page: 15,
			to: null,
			total: 0
		}
	}
};

export default initial_state;
