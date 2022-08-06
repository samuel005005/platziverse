'use strict'

module.exports = function setupAgent (AgentModel) {
  function findById (id) {
    return AgentModel.findById(id)
  }

  function findByUiid (uuid) {
    return AgentModel.findOne({
      where: {
        uuid
      }
    })
  }
  function findByUserName (username) {
    return AgentModel.findAll({
      where: {
        username,
        conneted: true
      }
    })
  }
  function findConnected () {
    return AgentModel.findAll({
      where: {
        conneted: true
      }
    })
  }

  function findAll () {
    return AgentModel.findAll()
  }

  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }
    const existingAgent = await AgentModel.findOne(cond)
    if (existingAgent) {
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    }
    const result = await AgentModel.create(agent)
    return result.toJson()
  }

  return {
    findById,
    findByUiid,
    findAll,
    findConnected,
    findByUserName,
    createOrUpdate
  }
}
