'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  applicationStatuses,
  type AdminApplication,
  type AdminUser,
  type ApplicationStatus,
} from '@/types/admin';
import styles from './AdminPanel.module.css';

type View = 'loading' | 'setup' | 'login' | 'dashboard';
type StatusFilter = 'all' | ApplicationStatus;

const statusLabels: Record<ApplicationStatus, string> = {
  new: 'Новые',
  'in-progress': 'В работе',
  done: 'Готово',
  archived: 'Архив',
};

function getErrorMessage(value: unknown, fallback: string) {
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  ) {
    return value.error;
  }
  return fallback;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('ru-KZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Almaty',
  }).format(timestamp);
}

function contactHref(application: AdminApplication) {
  if (application.contactMethod === 'email') return `mailto:${application.contact}`;
  if (application.contactMethod === 'whatsapp') {
    return `https://wa.me/${application.contact.replace(/\D/g, '')}`;
  }
  return `https://t.me/${application.contact.replace(/^@/, '')}`;
}

export function AdminPanel() {
  const [view, setView] = useState<View>('loading');
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [noteDraft, setNoteDraft] = useState({ applicationId: '', value: '' });
  const [username, setUsername] = useState('arnurmedetuly777');
  const [password, setPassword] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const selectedApplication =
    applications.find((application) => application.id === selectedId) ?? null;
  const notes =
    selectedApplication && noteDraft.applicationId === selectedApplication.id
      ? noteDraft.value
      : (selectedApplication?.notes ?? '');
  const visibleApplications = useMemo(
    () =>
      statusFilter === 'all'
        ? applications
        : applications.filter((application) => application.status === statusFilter),
    [applications, statusFilter],
  );

  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    setErrorMessage('');

    try {
      const [applicationsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/users'),
      ]);
      const [applicationsResult, usersResult]: [unknown, unknown] = await Promise.all([
        applicationsResponse.json(),
        usersResponse.json(),
      ]);

      if (!applicationsResponse.ok) {
        throw new Error(getErrorMessage(applicationsResult, 'Не удалось загрузить заявки.'));
      }
      if (!usersResponse.ok) {
        throw new Error(getErrorMessage(usersResult, 'Не удалось загрузить администраторов.'));
      }

      const nextApplications =
        typeof applicationsResult === 'object' &&
        applicationsResult !== null &&
        'applications' in applicationsResult &&
        Array.isArray(applicationsResult.applications)
          ? (applicationsResult.applications as AdminApplication[])
          : [];
      const nextUsers =
        typeof usersResult === 'object' &&
        usersResult !== null &&
        'users' in usersResult &&
        Array.isArray(usersResult.users)
          ? (usersResult.users as AdminUser[])
          : [];

      setApplications(nextApplications);
      setUsers(nextUsers);
      setSelectedId((current) =>
        nextApplications.some((application) => application.id === current)
          ? current
          : (nextApplications[0]?.id ?? ''),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить админку.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session');
        const result: unknown = await response.json();
        if (!active) return;

        if (response.status === 503) {
          setErrorMessage(getErrorMessage(result, 'Подключите базу данных админки в Cloudflare.'));
          setView('setup');
          return;
        }

        if (!response.ok) throw new Error(getErrorMessage(result, 'Не удалось проверить вход.'));

        if (
          typeof result === 'object' &&
          result !== null &&
          'user' in result &&
          typeof result.user === 'object' &&
          result.user !== null &&
          'id' in result.user &&
          typeof result.user.id === 'string' &&
          'username' in result.user &&
          typeof result.user.username === 'string' &&
          'isOwner' in result.user &&
          typeof result.user.isOwner === 'boolean'
        ) {
          setAdmin({
            id: result.user.id,
            username: result.user.username,
            createdAt: 0,
            isOwner: result.user.isOwner,
          });
          setView('dashboard');
          void loadDashboard();
          return;
        }

        setView('login');
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : 'Не удалось проверить вход.');
        setView('login');
      }
    }

    void checkSession();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(result, 'Не удалось войти.'));

      if (
        typeof result !== 'object' ||
        result === null ||
        !('user' in result) ||
        typeof result.user !== 'object' ||
        result.user === null ||
        !('id' in result.user) ||
        typeof result.user.id !== 'string' ||
        !('username' in result.user) ||
        typeof result.user.username !== 'string' ||
        !('isOwner' in result.user) ||
        typeof result.user.isOwner !== 'boolean'
      ) {
        throw new Error('Сервер вернул неожиданный ответ.');
      }

      setAdmin({
        id: result.user.id,
        username: result.user.username,
        createdAt: 0,
        isOwner: result.user.isOwner,
      });
      setPassword('');
      setView('dashboard');
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось войти.');
    } finally {
      setSaving(false);
    }
  }

  async function saveApplication(
    application: AdminApplication,
    status: ApplicationStatus,
    notesValue: string,
  ) {
    setSaving(true);
    setErrorMessage('');
    setNotice('');

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: application.id, status, notes: notesValue }),
      });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(result, 'Не удалось сохранить заявку.'));
      if (
        typeof result !== 'object' ||
        result === null ||
        !('application' in result) ||
        typeof result.application !== 'object' ||
        result.application === null
      ) {
        throw new Error('Сервер вернул неожиданный ответ.');
      }

      const savedApplication = result.application as AdminApplication;
      setApplications((current) =>
        current.map((item) => (item.id === savedApplication.id ? savedApplication : item)),
      );
      setNotice('Изменения сохранены.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось сохранить заявку.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteApplication(application: AdminApplication) {
    if (!window.confirm(`Удалить заявку «${application.projectType}»? Это действие нельзя отменить.`)) return;

    setSaving(true);
    setErrorMessage('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: application.id }),
      });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(result, 'Не удалось удалить заявку.'));

      const remainingApplications = applications.filter((item) => item.id !== application.id);
      setApplications(remainingApplications);
      setSelectedId((current) =>
        current === application.id ? (remainingApplications[0]?.id ?? '') : current,
      );
      setNoteDraft((current) =>
        current.applicationId === application.id ? { applicationId: '', value: '' } : current,
      );
      setNotice('Заявка удалена.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить заявку.');
    } finally {
      setSaving(false);
    }
  }

  async function addAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setNotice('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword }),
      });
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(getErrorMessage(result, 'Не удалось добавить администратора.'));

      setNewAdminUsername('');
      setNewAdminPassword('');
      setNotice('Администратор добавлен. Передайте ему логин и пароль безопасным способом.');
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось добавить администратора.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeAdmin(targetUsername: string) {
    if (!window.confirm(`Удалить администратора ${targetUsername}?`)) return;
    setSaving(true);
    setErrorMessage('');
    setNotice('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername }),
      });
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(getErrorMessage(result, 'Не удалось удалить администратора.'));
      setNotice(`Доступ ${targetUsername} отключён.`);
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить администратора.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Не удалось завершить сессию. Попробуйте ещё раз.');
      }
      setAdmin(null);
      setApplications([]);
      setUsers([]);
      setView('login');
      setNotice('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось выйти из админки.');
    } finally {
      setSaving(false);
    }
  }

  if (view === 'loading') {
    return (
      <div className={styles.authPanel} aria-busy="true">
        <p className={styles.eyebrow}>Рабочая область</p>
        <h1>Проверяю доступ…</h1>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className={styles.authPanel}>
        <p className={styles.eyebrow}>Рабочая область</p>
        <h1>Админка пока не подключена</h1>
        <p className={styles.description}>{errorMessage}</p>
        <p className={styles.description}>
          Создайте Cloudflare D1, подключите binding <code>ADMIN_DB</code>, примените SQL-миграцию и
          задайте секреты входа. Пошаговая инструкция есть в README.
        </p>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <form className={styles.authPanel} onSubmit={handleLogin}>
        <p className={styles.eyebrow}>Закрытая часть сайта</p>
        <h1>Вход для администратора</h1>
        <p className={styles.description}>Войдите, чтобы разбирать заявки и управлять доступом.</p>
        <label className={styles.field}>
          Логин
          <input
            autoComplete="username"
            autoCapitalize="none"
            maxLength={40}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Пароль
          <input
            autoComplete="current-password"
            maxLength={128}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
        <button className={styles.primaryButton} disabled={saving} type="submit">
          {saving ? 'Проверяю…' : 'Войти'}
        </button>
        <p className={styles.hint}>Минимальная длина пароля — 14 символов.</p>
      </form>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Рабочая область</p>
          <h1>Заявки</h1>
          <p className={styles.description}>
            Вы вошли как {admin?.username} · {admin?.isOwner ? 'владелец' : 'администратор'}.
          </p>
        </div>
        <button className={styles.secondaryButton} disabled={saving} onClick={logout} type="button">
          Выйти
        </button>
      </header>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <section aria-label="Заявки клиентов" className={styles.workspace}>
        <div className={styles.applicationPanel}>
          <div className={styles.panelHeading}>
            <h2>Входящие</h2>
            <span>{applications.length}</span>
          </div>
          <div aria-label="Фильтр заявок" className={styles.filters} role="group">
            <button
              aria-pressed={statusFilter === 'all'}
              className={statusFilter === 'all' ? styles.activeFilter : styles.filter}
              onClick={() => setStatusFilter('all')}
              type="button"
            >
              Все
            </button>
            {applicationStatuses.map((status) => (
              <button
                aria-pressed={statusFilter === status}
                className={statusFilter === status ? styles.activeFilter : styles.filter}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
          {loadingData ? (
            <div className={styles.skeleton} aria-label="Загружаю заявки" />
          ) : visibleApplications.length === 0 ? (
            <p className={styles.empty}>Пока нет заявок в этой категории.</p>
          ) : (
            <ul className={styles.applicationList}>
              {visibleApplications.map((application) => (
                <li className={styles.applicationItem} key={application.id}>
                  <button
                    aria-pressed={application.id === selectedId}
                    className={
                      application.id === selectedId
                        ? styles.selectedApplication
                        : styles.applicationButton
                    }
                    onClick={() => setSelectedId(application.id)}
                    type="button"
                  >
                    <span className={styles.applicationType}>{application.projectType}</span>
                    <span className={styles.applicationPreview}>{application.description}</span>
                    <span className={styles.applicationDate}>
                      {formatDate(application.submittedAt)}
                    </span>
                  </button>
                  <button
                    aria-label={`Удалить заявку: ${application.projectType}`}
                    className={styles.removeButton}
                    disabled={saving}
                    onClick={() => void deleteApplication(application)}
                    type="button"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.detailsPanel}>
          {selectedApplication ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <p className={styles.eyebrow}>{formatDate(selectedApplication.submittedAt)}</p>
                  <h2>{selectedApplication.projectType}</h2>
                </div>
                <span className={styles.statusBadge}>
                  {statusLabels[selectedApplication.status]}
                </span>
              </div>
              <p className={styles.detailDescription}>{selectedApplication.description}</p>
              <dl className={styles.facts}>
                <div>
                  <dt>Бюджет</dt>
                  <dd>{selectedApplication.budget}</dd>
                </div>
                <div>
                  <dt>Срок</dt>
                  <dd>{selectedApplication.deadline}</dd>
                </div>
                <div>
                  <dt>Способ связи</dt>
                  <dd>{selectedApplication.contactMethod}</dd>
                </div>
                <div>
                  <dt>Контакт</dt>
                  <dd>
                    <a href={contactHref(selectedApplication)}>{selectedApplication.contact}</a>
                  </dd>
                </div>
              </dl>
              <label className={styles.field}>
                Статус заявки
                <select
                  value={selectedApplication.status}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    if (applicationStatuses.some((status) => status === nextStatus)) {
                      void saveApplication(
                        selectedApplication,
                        nextStatus as ApplicationStatus,
                        notes,
                      );
                    }
                  }}
                >
                  {applicationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Моя заметка
                <textarea
                  maxLength={2_000}
                  rows={5}
                  value={notes}
                  onChange={(event) =>
                    setNoteDraft({
                      applicationId: selectedApplication.id,
                      value: event.target.value,
                    })
                  }
                />
              </label>
              <button
                className={styles.primaryButton}
                disabled={saving || notes === selectedApplication.notes}
                onClick={() =>
                  void saveApplication(selectedApplication, selectedApplication.status, notes)
                }
                type="button"
              >
                Сохранить заметку
              </button>
            </>
          ) : (
            <div className={styles.emptyDetails}>
              <p className={styles.eyebrow}>Заявка</p>
              <h2>Выберите обращение</h2>
              <p className={styles.description}>
                Здесь появятся описание, бюджет, срок и контакты клиента.
              </p>
            </div>
          )}
        </div>
      </section>

      {admin?.isOwner && (
        <section aria-labelledby="admins-title" className={styles.adminsPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Доступ</p>
              <h2 id="admins-title">Администраторы</h2>
            </div>
            <span>{users.length}</span>
          </div>
          <ul className={styles.adminList}>
            {users.map((user) => (
              <li key={user.id}>
                <span>
                  {user.username}
                  {user.isOwner ? ' · владелец' : ''}
                  {user.username === admin.username ? ' · вы' : ''}
                </span>
                {user.username !== admin?.username && (
                  <button
                    className={styles.removeButton}
                    disabled={saving}
                    onClick={() => void removeAdmin(user.username)}
                    type="button"
                  >
                    Удалить доступ
                  </button>
                )}
              </li>
            ))}
          </ul>
          <form className={styles.addAdminForm} onSubmit={addAdmin}>
            <label className={styles.field}>
              Логин нового администратора
              <input
                autoCapitalize="none"
                autoComplete="off"
                maxLength={40}
                required
                value={newAdminUsername}
                onChange={(event) => setNewAdminUsername(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              Временный пароль (от 14 символов)
              <input
                autoComplete="new-password"
                maxLength={128}
                minLength={14}
                required
                type="password"
                value={newAdminPassword}
                onChange={(event) => setNewAdminPassword(event.target.value)}
              />
            </label>
            <button className={styles.secondaryButton} disabled={saving} type="submit">
              Добавить администратора
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
