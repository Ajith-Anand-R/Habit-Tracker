describe('Habit Tracker Detox - Basic Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  it('creates a habit inline via the inline form', async () => {
    // Open inline form via FAB
    await element(by.id('fab-add')).tap()
    await element(by.id('inline-title')).typeText('Detox Habit')
    await element(by.id('inline-save')).tap()
    // Expect the new habit to appear in the Home list
    await expect(element(by.text('Detox Habit'))).toBeVisible()
  })
})
