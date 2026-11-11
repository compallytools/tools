<?php

declare(strict_types=1);

namespace App\ContrastGrid\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\ContrastGrid\State\PingProvider;

/**
 * Ressource exemple (DTO, sans persistance) : GET /api/contrast-grid/ping.
 *
 * Convention : chaque opération est nommée <module>_api_<action> pour être exposée au JS par UX Router.
 */
#[ApiResource(
    shortName: 'ContrastGridPing',
    operations: [
        new Get(
            uriTemplate: '/contrast-grid/ping',
            name: 'contrast_grid_api_ping',
            provider: PingProvider::class,
        ),
    ],
)]
final readonly class Ping
{
    public function __construct(
        public string $module,
        public string $status,
    ) {
    }
}
