# shiv.me — static site in htdocs/, deployed to GitHub Pages via Actions.

SITE := htdocs
OUT  := _site

.PHONY: dev build check clean deploy help

help:
	@echo "make dev     - run the local dev server (bun) with live reload"
	@echo "make build   - assemble the deployable site into $(OUT)/"
	@echo "make check   - sanity checks (stale refs, required files)"
	@echo "make deploy  - push master so the GitHub Pages Action deploys"
	@echo "make clean   - remove $(OUT)/"

dev:
	bun run dev.ts

# Mirror htdocs/ into _site/ — same tree GitHub Pages publishes.
build: clean check
	@mkdir -p $(OUT)
	@cp -R $(SITE)/. $(OUT)/
	@echo "Built $(OUT)/ from $(SITE)/"

check:
	@test -f $(SITE)/CNAME      || (echo "missing $(SITE)/CNAME" && exit 1)
	@test -f $(SITE)/.nojekyll  || (echo "missing $(SITE)/.nojekyll" && exit 1)
	@test -f $(SITE)/index.html || (echo "missing $(SITE)/index.html" && exit 1)
	@! grep -rl "index.redesign" $(SITE) >/dev/null 2>&1 || (echo "stale index.redesign refs" && exit 1)
	@echo "checks passed"

# Deployment is automatic: the Pages Action publishes htdocs/ on push to master.
deploy:
	git push origin master

clean:
	@rm -rf $(OUT)
