# my-portfolio

Personal portfolio site: [kemoshu.github.io/my-portfolio](https://kemoshu.github.io/my-portfolio/)

Plain HTML, CSS, and JavaScript. No frameworks, no build step.

## Run locally

```
python -m http.server 5173
```

Then open http://localhost:5173.

## Notes

- Dark and light themes, saved to localStorage.
- `documents/Kevin_Pierce_Ramos_Resume.pdf` is the resume linked across the site.
- When editing `styles.css` or `script.js`, bump the `?v=` query string in `index.html` so returning visitors get the new files.
