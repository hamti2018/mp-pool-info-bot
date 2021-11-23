import { mpapi } from './mpapi.js'

export function getBlockCountEndorsers(operations) {
  const findEndorsers = (operations) => {
    return operations.filter(operation => {
      if (Array.isArray(operation)) {
        return findEndorsers(operation).length > 0
      } else {
        if (operation.contents) { return findEndorsers(operation.contents).length > 0 } else {
          return operation.kind === 'endorsement'
        }
      }
    })
  }

  const endorserOperations = findEndorsers(operations).flat()
  const getBlockEndorsers = endorserOperations.map(operation => ({
    address: operation.contents[0].metadata.delegate,
    slots: operation.contents[0].metadata.slots.length,
    level: operation.contents[0].level
  }))
  return getBlockEndorsers.reduce((count, endorser) => count + endorser.slots, 0)
}

export async function getBakingRights (mp1, cycle, blocks = 'head', priority = 0) {
  return mpapi.node.query(`/chains/main/blocks/${blocks}/helpers/baking_rights` +
    `?cycle=${cycle}&delegate=${mp1}&max_priority=${priority}`)
}
export async function getEndorsingRights (mp1, cycle, blocks = 'head', priority = 0) {
  return mpapi.node.query(`/chains/main/blocks/${blocks}/helpers/endorsing_rights` +
    `?cycle=${cycle}&delegate=${mp1}&max_priority=${priority}`)
}
