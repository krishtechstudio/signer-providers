import {
    Button,
    ExternalLink,
    Flex,
    Heading,
    Text,
} from '@waves.exchange/react-uikit';
import React, { FC } from 'react';
import { getEnvAwareUrl } from '../../utils/getEnvAwareUrl';

type ForgotPasswordProps = {
    onSignUpClick(): void;
    onSignInClick(): void;
};

export const ForgotPassword: FC<ForgotPasswordProps> = ({
    onSignInClick,
    onSignUpClick,
}) => {
    return (
        <Flex
            as="form"
            px="$40"
            pb="$40"
            flexDirection="column"
            justifyContent="center"
        >
            <Heading
                level={2}
                textAlign="center"
                mb="24px"
                color="standard.$0"
                fontWeight={500}
            >
                Forgot your password?
            </Heading>

            <Text
                variant="body2"
                color="basic.$500"
                textAlign="center"
                mb="24px"
            >
                Don't worry! You can reset password at{' '}
                <ExternalLink href={getEnvAwareUrl()} target="_blank">
                    waves.exchange
                </ExternalLink>{' '}
                and then go back to continue the login process
            </Text>

            <Flex justifyContent="space-between">
                <Button
                    flex={1}
                    variantSize="medium"
                    mr="32px"
                    color="primary.$300"
                    border="1px solid"
                    borderColor="primary.$300"
                    backgroundColor="transparent"
                    onClick={onSignUpClick}
                >
                    Sign Up
                </Button>
                <Button
                    flex={1}
                    variant="primary"
                    variantSize="medium"
                    onClick={onSignInClick}
                >
                    Log In
                </Button>
            </Flex>
        </Flex>
    );
};
