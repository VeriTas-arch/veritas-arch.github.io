export {};

interface ReadingPreferences {
    theme: 'light' | 'dark';
    font: 'serif' | 'sans';
    size: string;
}

const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('#theme-toggle');
const settings = document.querySelector<HTMLDetailsElement>('.settings');
const sizeSlider = document.querySelector<HTMLInputElement>('#text-size');
if (themeButton && settings && sizeSlider) {
    const preferences: ReadingPreferences = { theme: 'light', font: 'serif', size: '19' };
    try {
        const stored: unknown = JSON.parse(localStorage.getItem('article-study') || '{}');
        if (stored !== null && typeof stored === 'object') {
            preferences.theme = 'theme' in stored && stored.theme === 'dark' ? 'dark' : 'light';
            preferences.font = 'font' in stored && stored.font === 'sans' ? 'sans' : 'serif';
            if ('size' in stored && (typeof stored.size === 'string' || typeof stored.size === 'number')) {
                preferences.size = String(stored.size);
            }
        }
    } catch { }

    const applyPreferences = () => {
        root.dataset.theme = preferences.theme;
        root.style.setProperty('--body-font', preferences.font === 'sans' ? 'var(--sans)' : 'var(--serif)');
        const size = Number(preferences.size);
        preferences.size = Number.isInteger(size) && size >= 17 && size <= 25 ? String(size) : '19';
        root.style.setProperty('--body-size', `${preferences.size}px`);
        sizeSlider.value = preferences.size;
        sizeSlider.setAttribute('aria-valuetext', `${preferences.size} pixels`);
        themeButton.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        themeButton.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
        document.querySelectorAll<HTMLButtonElement>('[data-font]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.font === preferences.font));
        });
        try { localStorage.setItem('article-study', JSON.stringify(preferences)); } catch { }
        requestAnimationFrame(updateMathOverflow);
    };
    themeButton.addEventListener('click', () => {
        preferences.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyPreferences();
    });

    document.querySelectorAll<HTMLButtonElement>('[data-font]').forEach(button => {
        button.addEventListener('click', () => {
            const font = button.dataset.font;
            if (font !== 'serif' && font !== 'sans') return;
            preferences.font = font;
            applyPreferences();
        });
    });
    sizeSlider.addEventListener('input', () => {
        preferences.size = sizeSlider.value;
        applyPreferences();
    });

    document.addEventListener('click', event => {
        if (event.target instanceof Node && !settings.contains(event.target)) settings.open = false;
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && settings.open) {
            settings.open = false;
            settings.querySelector<HTMLElement>('summary')?.focus();
        }
    });
    applyPreferences();
}

const headings = [...document.querySelectorAll('.article-body h2')];
const articleBody = document.querySelector('.article-body');
function updateMathOverflow() {
    if (!articleBody) return;
    articleBody.querySelectorAll('mjx-container:not([display="true"])').forEach(container => {
        const math = container.querySelector('mjx-math');
        const parent = container.closest('p, li, td, th, blockquote, h2, h3, h4, .article-body');
        if (!math || !parent) return;
        const style = getComputedStyle(parent);
        const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        // Only formulas wider than a whole line need their own scrollable row.
        container.classList.toggle('math-overflow', math.getBoundingClientRect().width > available + 1);
    });
}
function updateReadingPosition() {
    const lastRead = headings.filter(heading => heading.getBoundingClientRect().top <= 130).at(-1);
    document.querySelectorAll<HTMLAnchorElement>('.toc a').forEach(link => {
        if (lastRead && link.hash === `#${lastRead.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}
let scrollScheduled = false;
window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => { updateReadingPosition(); scrollScheduled = false; });
}, { passive: true });
window.addEventListener('resize', updateReadingPosition);
if (articleBody) new ResizeObserver(() => {
    requestAnimationFrame(updateMathOverflow);
    updateReadingPosition();
}).observe(articleBody);
updateReadingPosition();

document.querySelectorAll<HTMLAnchorElement>('.mobile-toc a').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        const toc = link.closest<HTMLDetailsElement>('.mobile-toc');
        if (!target || !toc) return;
        toc.open = false;
        history.replaceState(null, '', link.hash);
        target.scrollIntoView();
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
    });
});

document.querySelectorAll('.copy-code').forEach(button => {
    button.addEventListener('click', async () => {
        try {
            const code = button.closest('.highlighter-rouge')?.querySelector('pre');
            if (!code) return;
            await navigator.clipboard.writeText(code.textContent || '');
            button.textContent = 'Copied';
        } catch { button.textContent = 'Select to copy'; }
        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
    });
});
