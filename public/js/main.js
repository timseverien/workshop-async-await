import cache from './lib/cache.js';
import {
	render,
	renderError,
	orgTpl,
	reposTpl,
	repoTpl,
	contributorsTpl,
} from './templates.js';

const API_URL = 'https://api.github.com';
const API_TOKEN = ''; // TODO: ADD ACCESS TOKEN HERE
const USE_CACHE = true;

const getJSON = async (url) => {
	const isError = Math.floor(Math.random() * 10) === 0; // 10% error chance

	if (isError) {
		throw new Error('Network error!');
	}

	const fromCache = USE_CACHE && cache.get(url);

	if (fromCache) {
		return fromCache;
	}

	const json = await fetch(url)
		.then(res => res.json());

	if (USE_CACHE) {
		cache.set(url, json);
	}

	return json;
};

const getRepos = async url => getJSON(`${url}?access_token=${API_TOKEN}`)
	.then(repos => repos.filter(r => !r.fork))
	.then(repos => repos.sort(r => new Date(r.updated_at).getTime()));

// IIFE to kick it all off
(async () => {
	let org;

	try {
		org = await getJSON(`${API_URL}/orgs/vicompany?access_token=${API_TOKEN}`);
	} catch (err) {
		return renderError(err);
	}

	const el = document.querySelector('#org');

	render(el, org, orgTpl);

	const { repos_url: reposUrl } = org;
	let repos;

	try {
		repos = await getRepos(reposUrl);
	} catch (err) {
		return renderError(err);
	}

	const reposEl = document.querySelector('#repos');

	render(reposEl, repos, reposTpl);

	document
		.querySelector('main')
		.addEventListener('click', async (e) => {
			const { target } = e;
			const modal = document.querySelector('#modal');

			if (target.classList.contains('js-repo')) {
				let repo;

				e.preventDefault();

				try {
					repo = await getJSON(`${target.href}?access_token=${API_TOKEN}`);
				} catch (err) {
					return renderError(err);
				}

				render(modal, repo, repoTpl);
				modal.querySelector('dialog').showModal();
			}

			if (target.classList.contains('js-contributors')) {
				let contributors;

				e.preventDefault();

				try {
					contributors = await getJSON(`${target.href}?access_token=${API_TOKEN}`);
				} catch (err) {
					return renderError(err);
				}

				const contributionsTotal = contributors
					.reduce((sum, c) => sum + c.contributions, 0);

				const users = await Promise
					.all(contributors.map(contributor => getJSON(`${API_URL}/users/${contributor.login}?access_token=${API_TOKEN}`)));

				const data = {
					contributors,
					contributionsTotal,
					users,
				};

				render(modal, data, contributorsTpl);

				modal.querySelector('dialog').showModal();
			}

			if (target.classList.contains('js-modal-close')) {
				e.preventDefault();
				target.closest('dialog').close();
			}
		});
})();
