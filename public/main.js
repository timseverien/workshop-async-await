import { error, org } from './templates.js';

const render = (el, data, tpl = error, append = false) => {
	const html = tpl(data);

	if (append) {
		return el.insertAdjacentHTML('beforeend', html);
	}

	return (el.innerHTML = html);
};

// repos
// - repo details
// -- contributers
// -- contributer counts

const BASE_URL = 'https://api.github.com';

const getJSON = (url, callback) => {
	const xhr = new XMLHttpRequest();

	xhr.open('GET', url);

	xhr.onload = () => {
		if (xhr.status === 200) {
			return callback(null, JSON.parse(xhr.responseText));
		}

		return callback(new Error(`Request failed: ${xhr.statusText}`));
	};

	xhr.onabort = () => callback(new Error(`Request failed: ${xhr.statusText}`)); // Use abort as fake error

	xhr.send();

	// 20% error chance :p
	if (Math.floor(Math.random() * 5) === 0) {
		xhr.abort();
	}
};

const renderError = (el, msg = 'Oops!') => (el.textContent = msg);

const renderUsers = (el, users) => {
	const html = `
		<dl>
			${users.map(u => `
				<div>
					<dt>User</dt>
					<dd><a href="/users/${u.id}"><img class="avatar" src="${u.avatar}" alt="${u.name}" />${u.name}</a></dd>
					<dt>Transactions</dt>
					<dd><a href="/users/${u.id}/transactions" class="js-load-transactions">Load</a></dd>
				</div>
			`).join('')}
		</dl>
	`;

	el.innerHTML = html;
};

const renderTransactions = (el, transactions) => {
	const html = `
		<dl class="js-transactionlist">
			${transactions.map(t => `
				<dt><a href="/transactions/${t.id}">Transaction: ${t.id}</a></dt>
				<dd><a href="/products/${t.productId}">Product: ${t.productId}</a><dd>
				<dd class="todo">Product price/details<dd>
			`).join('')}
			<dt>Total $</dt>
			<dd class="todo">transaction amount</dd>
		</dl>
	`;

	el.innerHTML = html;
};

const loadTransactions = (el) => {
	const { href, parentElement: container } = el;

	if (!href) {
		return;
	}

	getJSON(href, (err, transactions) => {
		if (err) {
			return renderError(container, 'Transaction unavailable!');
		}

		return renderTransactions(container, transactions);
	});
};

// IIFE to kick it all off
(() => {
	const main = document.querySelector('main');

	getJSON(`${BASE_URL}/orgs/vicompany`, (err, data) => {
		if (err) {
			return render(main, 'Cannot retrieve org', error);
		}

		console.log('org', org(data), data);

		return render(main, data, org);

		// container.insertAdjacentHTML('beforeend', org(data));
	});

	// getJSON('/users', (err, users) => {
	// 	if (err) {
	// 		renderError(container, 'Cannot retrieve users!');

	// 		return;
	// 	}

	// 	renderUsers(container, users);

	// 	container.addEventListener('click', (e) => {
	// 		const link = e.target.closest('.js-load-transactions');

	// 		if (link) {
	// 			e.preventDefault();

	// 			loadTransactions(link);
	// 		}
	// 	});
	// });
})();
