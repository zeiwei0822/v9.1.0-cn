import { css } from '@emotion/css';
import React, { FC, useState } from 'react';

import { GrafanaTheme } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Form, Field, Input, Button, Legend, Container, useStyles, HorizontalGroup, LinkButton } from '@grafana/ui';
import config from 'app/core/config';

interface EmailDTO {
  userOrEmail: string;
}

const paragraphStyles = (theme: GrafanaTheme) => css`
  color: ${theme.colors.formDescription};
  font-size: ${theme.typography.size.sm};
  font-weight: ${theme.typography.weight.regular};
  margin-top: ${theme.spacing.sm};
  display: block;
`;

export const ForgottenPassword: FC = () => {
  const [emailSent, setEmailSent] = useState(false);
  const styles = useStyles(paragraphStyles);
  const loginHref = `${config.appSubUrl}/login`;

  const sendEmail = async (formModel: EmailDTO) => {
    const res = await getBackendSrv().post('/api/user/password/send-reset-email', formModel);
    if (res) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div>
        <p>一封帶有重置鏈接的電子郵件已發送到該電子郵件地址。您應該很快就會收到。</p>
        <Container margin="md" />
        <LinkButton variant="primary" href={loginHref}>
          回到登入頁面
        </LinkButton>
      </div>
    );
  }
  return (
    <Form onSubmit={sendEmail}>
      {({ register, errors }) => (
        <>
          <Legend>重設密碼</Legend>
          <Field
            label="使用者"
            description="請輸入您的信箱以發送新鏈接"
            invalid={!!errors.userOrEmail}
            error={errors?.userOrEmail?.message}
          >
            <Input
              id="user-input"
              placeholder="電子郵件或用戶名"
              {...register('userOrEmail', { required: '請輸入電子郵件或用戶名' })}
            />
          </Field>
          <HorizontalGroup>
            <Button type="submit">Send reset email</Button>
            <LinkButton fill="text" href={loginHref}>
              回到登入頁面
            </LinkButton>
          </HorizontalGroup>

          <p className={styles}>是否忘記了用戶名或電子郵件？請聯繫Grafana管理員。</p>
        </>
      )}
    </Form>
  );
};
