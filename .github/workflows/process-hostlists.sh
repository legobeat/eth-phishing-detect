#!/usr/bin/env bash
process_list() {
  _list=$1
  git show ADD_HOSTS_HERE/$_list | grep . >/dev/null \
    && node src/add-hosts.js $_list \
      $(git show --name-only --oneline ADD_HOSTS_HERE/$_list/ | tail -n +2 | xargs -r grep -hEv '^$|^#') \
    && echo "done $_list" || echo "skipped $_list"
}
process_list whitelist
process_list blacklist
process_list fuzzylist

export _branch=ci-merge-$(git rev-parse --short HEAD)
git diff src/config.json \
    && git checkout -b $_branch \
    && git add src/config.json \
    && git rm ADD_HOSTS_HERE/*/* \
    && git commit -m 'update hostlists' \
    && git push -u origin $_branch
echo 'done'
