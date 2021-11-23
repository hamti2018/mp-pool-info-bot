'use strict'

import { mpapi } from 'mineplex-rpcapi'

mpapi.node.setProvider(process.env.RPC_HOST)
mpapi.node.setDebugMode(false)

export { mpapi }
