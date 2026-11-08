# Commands
- Run one spec: npm test -- --no-watch --include <path>
- Run all specs: npm test -- --no-watch

# Gotchas
- Don't use `npx ng test --include`: the RTK hook's rewrite drops the filter and runs every spec
- Angular 22 needs Node `^22.22.3 || ^24.15.0 || >=26`; Node 25 is unsupported
