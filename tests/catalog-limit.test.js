const test = require('node:test')
const assert = require('node:assert/strict')

function canAddFreeItem(items) {
  return items.filter(item => item.is_active !== false).length < 5
}

test('free catalog limit is five active items', () => {
  assert.equal(canAddFreeItem([{ is_active: true }, { is_active: true }, { is_active: true }, { is_active: true }]), true)
  assert.equal(canAddFreeItem([{ is_active: true }, { is_active: true }, { is_active: true }, { is_active: true }, { is_active: true }]), false)
})

test('inactive catalog items do not consume the free allowance', () => {
  assert.equal(canAddFreeItem([{ is_active: true }, { is_active: true }, { is_active: true }, { is_active: true }, { is_active: true }, { is_active: false }]), false)
})
