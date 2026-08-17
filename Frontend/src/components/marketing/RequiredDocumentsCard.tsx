import { CheckCircle2Icon, FileTextIcon, ShieldCheckIcon, UploadCloudIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function RequiredDocumentsCard() {
  const { t } = useI18n();

  const documents = [
    {
      id: 'doc1',
      icon: FileTextIcon,
      titleKey: 'driversPage.docs.d1Title',
      descKey: 'driversPage.docs.d1Desc',
      tagKey: 'driversPage.docs.d1Tag'
    },
    {
      id: 'doc2',
      icon: ShieldCheckIcon,
      titleKey: 'driversPage.docs.d2Title',
      descKey: 'driversPage.docs.d2Desc',
      tagKey: 'driversPage.docs.d2Tag'
    },
    {
      id: 'doc3',
      icon: CheckCircle2Icon,
      titleKey: 'driversPage.docs.d3Title',
      descKey: 'driversPage.docs.d3Desc',
      tagKey: 'driversPage.docs.d3Tag'
    }
  ];

  return (
    <Card tone="soft" className="overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/10 px-3.5 py-1 text-2xs font-semibold text-action">
              <UploadCloudIcon className="h-3.5 w-3.5" />
              {t('driversPage.docs.badge')}
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('driversPage.docs.title')}
            </h3>
            <p className="mt-1 max-w-2xl text-2xs text-muted">
              {t('driversPage.docs.subtitle')}
            </p>
          </div>

          <Button to="/portail/documents" variant="primary" size="md">
            {t('driversPage.docs.cta')}
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {documents.map(({ id, icon: Icon, titleKey, descKey, tagKey }, idx) => (
            <div
              key={id}
              className="group relative flex flex-col justify-between rounded-card border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:border-action/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-action transition-colors group-hover:bg-action group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xs font-bold text-muted">0{idx + 1}</span>
                </div>

                <h4 className="mt-4 font-display text-base font-semibold text-ink">
                  {t(titleKey)}
                </h4>
                <p className="mt-2 text-2xs leading-relaxed text-muted">
                  {t(descKey)}
                </p>
              </div>

              <div className="mt-5 border-t border-line pt-3">
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-600">
                  {t(tagKey)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
