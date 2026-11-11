<?php

declare(strict_types=1);

namespace App\Tests\__MODULE__\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class __MODULE__ControllerTest extends WebTestCase
{
    public function testIndexOnModuleHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => '__kebab__.localhost']);

        self::assertResponseIsSuccessful();
        self::assertSelectorTextContains('.page-header h1', '__LABEL__');
        self::assertSelectorTextContains('main', '__kebab__.localhost');
    }

    public function testIndexIsNotServedOnAnotherHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'other.localhost']);

        self::assertResponseStatusCodeSame(404);
    }
}
