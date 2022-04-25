'use strict'

import { mpapi } from 'mineplex-rpcapi'

import { PRC_HOST } from '../config.js'

mpapi.node.setProvider(PRC_HOST)
mpapi.node.setDebugMode(false)

export { mpapi }
