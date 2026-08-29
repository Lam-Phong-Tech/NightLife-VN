import {
  ContentTranslationService,
  contentTranslationInternals,
} from './content-translation.service';

describe('ContentTranslationService', () => {
  const service = new ContentTranslationService();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the reviewed shared street-name dictionary', async () => {
    const request = jest.spyOn(global, 'fetch');

    await expect(
      service.translateStreetNameToJapanese('Thái Văn Lung'),
    ).resolves.toBe('タイヴァンルン');
    expect(request).not.toHaveBeenCalled();
  });

  it('translates free text without modifying browser DOM', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          [['洗練された空間です。', 'Không gian tinh tế.', null, null, 3]],
          null,
          'vi',
        ]),
        { status: 200 },
      ),
    );

    await expect(
      service.translateVietnameseToJapanese('<p>Không gian tinh tế.</p>'),
    ).resolves.toBe('洗練された空間です。');
  });

  it('returns null when the provider is unavailable so admin saves can continue', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(
      service.translateVietnameseToJapanese('Nội dung mới'),
    ).resolves.toBeNull();
  });

  it('normalizes rich text before sending it for translation', () => {
    expect(
      contentTranslationInternals.htmlToPlainText(
        '<p>Dòng một<br>Dòng hai &amp; ba</p>',
      ),
    ).toBe('Dòng một\nDòng hai & ba');
  });
});
