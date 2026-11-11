<?php

declare(strict_types=1);

namespace App\ContrastGrid\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ContrastGrid\ApiResource\Ping;

/**
 * @implements ProviderInterface<Ping>
 */
final readonly class PingProvider implements ProviderInterface
{
    #[\Override]
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): Ping
    {
        return new Ping(module: 'ContrastGrid', status: 'ok');
    }
}
