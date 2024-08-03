import { LintRuleLinter, rulesCache } from './rules'

class Resolver {
  constructor() {}

  resolveRule(pkg: string, ruleName: string): LintRuleLinter {
    const rule = rulesCache[pkg + '/' + ruleName]

    if (!rule) {
      throw new Error('cannot resolve rule <' + pkg + '/' + ruleName + '>')
    }

    return rule
  }

  resolveConfig(pkg: string, configName: string) {
    throw new Error('cannot resolve config <' + configName + '> in <' + pkg + '>')
  }
}

export default Resolver
