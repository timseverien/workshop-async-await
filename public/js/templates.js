import { html, render } from 'https://unpkg.com/lit-html@0.6.0/lit-html.js';

const errorTpl = ({ message = 'Oops!' } = {}) => html`
	<dialog class="error">
		<div>${message}</div>
	</dialog>
`;

const orgTpl = org => html`
	<h1>
		<a href="${org.url}" target="blank" title="View API on Github"><img class="logo" src="${org.avatar_url}" alt="logo" /> ${org.name}</a>
	</h1>
	<p>${org.description}</p>
`;

const reposTpl = repos => html`
	<h2>Repositories</h2>
	<ul>
		${repos.map(r => html`
			<li>
				<a class="js-repo" href="${r.url}">${r.name}</a> - <a class="js-contributors" href="${r.contributors_url}">contributors</a>
			</li>
		`)}
	</ul>
`;

const repoTpl = repo => html`
	<dialog>
		<h2>${repo.full_name}</h2>
		<p>${repo.description || 'No description available'}</p>
		<p>View <a href="${repo.html_url}" target="blank">${repo.name}</a> on Github.<p>
		<button class="js-modal-close">close</button>
	</dialog>
`;

const contributorsTpl = data => html`
	<dialog>
		<dl>
			<dt>Contributors</dt>
				${data.users.map(u => html`
					<dd>
						<a href="${u.url}"><img class="avatar" src="${u.avatar_url}" alt="avatar" />${u.login}</a>
						<dl class="user">
							<dt>Full name</dt>
							<dd>${u.name}</dd>
							<dt>Public repos</dt>
							<dd>${u.public_repos}</dd>
							<dt>Followers</dt>
							<dd>${u.followers}</dd>
						</dl>
					</dd>
				`)}
			<dt>Total contributions</dt>
			<dd>${data.contributionsTotal}</dd>
		</dl>
		<button class="js-modal-close">close</button>
	</dialog>
`;

const renderHtml = (el, data, tpl) => {
	render(tpl(data), el);

	return el;
};

const renderError = (err) => {
	const el = renderHtml(document.querySelector('#error'), err, errorTpl);
	const dialog = el.querySelector('dialog');

	dialog.show();

	setTimeout(() => dialog.close(), 1500);
};

export {
	renderHtml as render,
	renderError,
	orgTpl,
	reposTpl,
	repoTpl,
	contributorsTpl,
};
